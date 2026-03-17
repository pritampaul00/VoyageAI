"use client";

import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import axios from "axios";

import EmptyState from "./EmptyState";
import GroupSizeUI from "./GroupSizeUI";
import BudgetUI from "./BudgetUI";
import TripDurationUI from "./TripDurationUI";
import FinalItineraryUI from "./FinalItineraryUI";
import LimitReachedUI from "./LimitReachedUI";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import { useTripDetail } from "@/app/provider";
import { Hotel } from "@/app/types/hotel";

export type TripInfo = {
  origin?: string;
  destination?: string;
  duration?: string | number;
  budget?: string;
  group_size?: string | number;

  hotels?: Hotel[];

  itinerary?: {
    day: number;
    best_time_to_visit_day?: string;
    activities?: {
      place_name: string;
      description?: string;
      location?: string;
      start_time?: string;
      end_time?: string;
      travel_time?: string;
      image?: string;
      place_image_url?: string;
      geo_coordinates?: {
        latitude: number;
        longitude: number;
      };
    }[];
  }[];
};

type Message = {
  role: "user" | "assistant";
  content: string;
  ui?: string;
};

type CollectedState = {
  origin: string;
  destination: string;
  group_size: string;
  budget: string;
  duration: string;
};

type Props = {
  prefilledDestination?: string;
  initialPrompt?: string;
};

export default function Chatbox({
  prefilledDestination,
  initialPrompt,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [tripDetail, setTripDetail] = useState<TripInfo | null>(null);
  const { setTripDetailInfo, setViewMode, setTripId } = useTripDetail();

  //const { setTripDetailInfo, setViewMode } = useTripDetail();

  const [tripStatus, setTripStatus] =
    useState<"idle" | "created" | "updated">("idle");

  const [changeSummary, setChangeSummary] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  //const [tripId, setTripId] = useState<string | null>(null);

  const [collected, setCollected] = useState<CollectedState>({
    origin: "",
    destination: "",
    group_size: "",
    budget: "",
    duration: "",
  });

  const { user, isLoaded } = useUser();

  const getUserByClerkId = useQuery(
    api.user.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const saveTripDetail =
    useMutation(api.tripDetail.createTripDetail);

  const hasStarted = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (hasStarted.current) return;
    if (messages.length > 0) return;

    if (initialPrompt) {
      hasStarted.current = true;
      onSend(initialPrompt);
      return;
    }

    if (prefilledDestination) {
      hasStarted.current = true;
      onSend(`I want to plan a trip to ${prefilledDestination}`);
    }
  }, [initialPrompt, prefilledDestination]);

  const onSend = async (messageToSend?: string) => {
    const input = messageToSend ?? userInput;

    if (!input) return;

    if (!messageToSend) setUserInput("");

    const newMsg: Message = {
      role: "user",
      content: input,
    };

    const history = [...messages, newMsg];

    setMessages(history);

    setIsLoading(true);

    try {
      const res = await axios.post("/api/aimodel", {
        messages: history,
        collected,
        isFinal: false,
      });

      if (res.data.collected) {
        setCollected(res.data.collected);
      }

      if (res.data.ui === "final") {
        if (messages.some(m => m.ui === "final")) {
          return
        }
        const finalRes = await axios.post("/api/aimodel", {
          messages: [
            {
              role: "user",
              content: `
Create a travel itinerary.

Origin: ${collected.origin}
Destination: ${collected.destination}
Group size: ${collected.group_size}
Budget: ${collected.budget}
Duration: ${collected.duration}

Generate a structured itinerary following realistic travel planning rules.
`
            }
          ],
          collected,
          isFinal: true,
        });

        // const finalRes = await axios.post("/api/aimodel", {
        //   messages: history,
        //   collected,
        //   isFinal: true,
        // });

        const finalPlan = finalRes.data.trip_plan;

        setTripDetailInfo(finalPlan);
        setViewMode("itinerary");
        setTripDetail(finalPlan);

        setTripStatus("created");
        setChangeSummary("Your trip is ready.");

        if (isLoaded && user?.id && getUserByClerkId) {
          const newTripId = uuidv4();

          await saveTripDetail({
            tripId: newTripId,
            uid: getUserByClerkId._id,
            tripDetail: finalPlan,
            createdAt: new Date().toISOString()
          });

          setTripId(newTripId);
        }

        setMessages((prev) => {
          if (prev.some((m) => m.ui === "final")) {
            return prev;
          }

          return [
            ...prev,
            {
              role: "assistant",
              content: "",
              ui: "final",
            },
          ];
        });

        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.resp,
          ui: res.data.ui,
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUI = (ui: string) => {
    if (ui === "budget") {
      return <BudgetUI onSelectedOption={onSend} />;
    }

    if (ui === "groupSize") {
      return <GroupSizeUI onSelectedOption={onSend} />;
    }

    if (ui === "TripDuration") {
      return (
        <TripDurationUI
          onSelectedOption={(value) => onSend(value)}
        />
      );
    }

    if (ui === "limit") {
      return <LimitReachedUI />;
    }

    if (ui === "final") {
      return (
        <FinalItineraryUI
          planningText="Trip Ready"
          isTripReady={!!tripDetail}
          tripStatus={tripStatus}
          changeSummary={changeSummary}
        />
      );
    }

    return null;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">

        {messages.length === 0 && (
          <EmptyState onSelectOption={onSend} />
        )}

        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] bg-gray-900 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start gap-2.5">

              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-500 text-xs font-bold">
                  V
                </span>
              </div>

              <div className="max-w-[85%]">

                {msg.content && (
                  <div className="bg-gray-100 text-gray-800 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm">
                    {msg.content}
                  </div>
                )}

                {msg.ui && (
                  <div className="mt-2">
                    {renderUI(msg.ui)}
                  </div>
                )}

              </div>

            </div>
          )
        )}

        {isLoading && (
          <div className="flex justify-start gap-2.5">

            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-500 text-xs font-bold">
                V
              </span>
            </div>

            <div className="bg-gray-100 px-4 py-3 rounded-2xl flex gap-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
            </div>

          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-white">

        <div className="flex items-end gap-2 border border-gray-200 bg-gray-50 rounded-xl px-3 py-2">

          <Textarea
            placeholder="Create a trip from Paris to New York"
            value={userInput}
            className="flex-1 bg-transparent border-none resize-none text-sm"
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />

          <button
            onClick={() => onSend()}
            disabled={!userInput.trim()}
            className="w-8 h-8 flex items-center justify-center bg-gray-900 hover:bg-orange-500 text-white rounded-lg"
          >
            <Send className="h-3.5 w-3.5" />
          </button>

        </div>

        <p className="text-[11px] text-gray-400 mt-1.5 text-center">
          Press Enter to send
        </p>

      </div>

    </div>
  );
}



