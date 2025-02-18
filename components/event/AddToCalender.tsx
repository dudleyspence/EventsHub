"use client";
/*

Expected Behaviour of the many tokens: 

Scenario 1: User logged in with Google

- google auth scope is set to include calendar access
- Google signs in and a normal JWT is made by auth.js but also google provides a google access token.
- this will be stored in the 'access_token' field of the account Prisma table
- now the user is logged in an while logged in their JWT info is stored in a session token
- I will change the callback for session so that if the provider is google then the access token will be included in the session. 
- I will also need to change the JWT callback to refresh the access token if it has expired
- if they click 'add to calendar' i will check the session for an access token
- This token will be used for the event adding etc.



Scenario 2: User logged in with Github/Credentials

- User logged in with Github and so does not have a google access token also the access token field may be filled with a Github access token.
- When they click 'add to calendar' the account table will be looked at and we can see the provider is 'github' therefore we need to request an access token from google 

*/

import { addToCalendarAction } from "@/lib/actions/addToCalendar";
import { googleAccessCheck } from "@/lib/actions/authProviderCheck";
import { useAlert } from "@/context/AlertContext";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

export function GoogleCalendarIcon({
  width = 20,
  height = 20,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Image
      alt="google calendar icon"
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/512px-Google_Calendar_icon_%282020%29.svg.png"
      width={width}
      height={height}
    />
  );
}

export default function AddToCalender({ event_id }: { event_id: string }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const { setMessage, setColor, setShowAlert, setTitle, setIcon } = useAlert();

  function AddedToCalendarMessage({ link }: { link: string }) {
    return (
      <div className="flex flex-col gap-3 mt-1">
        <p>You have successfully added the event to your calendar</p>
        <Link className="hover:underline font-bold" href={link}>
          Click here to view the calendar!
        </Link>
      </div>
    );
  }

  function handleAddToCalender() {
    startTransition(async () => {
      const isOAuthResponse = await googleAccessCheck();

      if (!isOAuthResponse) {
        onOpen();
        return;
      }

      const response = await addToCalendarAction(event_id);
      console.log(response);
      if (response.success) {
        setSuccess(true);
        if (response.link) {
          setMessage(<AddedToCalendarMessage link={response.link} />);
        } else {
          setMessage("Event added to your calendar");
        }
        setTitle("Added to Google Calendar!");
        setColor("success");
        setShowAlert(true);
        setIcon(<GoogleCalendarIcon />);
      }
    });
  }

  return (
    <div>
      <Button
        isLoading={isPending}
        isDisabled={success || isPending}
        onPress={handleAddToCalender}
        variant={success ? "flat" : "bordered"}
        color={success ? "success" : "default"}
        startContent={<GoogleCalendarIcon />}
        className="!text-black w-[175px]"
      >
        {success ? "Added" : "Add to Calendar"}
      </Button>
      <GoogleAccessModel isOpen={isOpen} onOpenChange={onOpenChange} />
    </div>
  );
}

export function GoogleAccessModel({
  onOpenChange,
  isOpen,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  function handleSignInWithGoogle(onClose: () => void) {
    signIn("google", { callbackUrl: window.location.href });
    onClose();
  }

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-row gap-3">
                <GoogleCalendarIcon width={30} height={30} /> Google Calendar
                Access
              </ModalHeader>
              <ModalBody>
                <p>
                  You must sign in to give EventHub access to your Google
                  Calendar
                </p>
                <div
                  onClick={() => {
                    handleSignInWithGoogle(onClose);
                  }}
                  className="w-full flex flex-row gap-3 justify-center items-center h-[70px] shadow-xl rounded-xl bg-orange-100 my-5"
                >
                  <Icon icon="flat-color-icons:google" width={30} />
                  <h1 className="font-bold text-2xl">Sign in with Google</h1>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
