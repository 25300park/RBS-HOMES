"use client";

import { CopyIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "@/hooks/use-media-query";
import { IoShareSocialOutline } from "react-icons/io5";
import { useToast } from "@/hooks/use-toast";

export function ShareBtn() {
  const isMobile = useMediaQuery("(max-width: 640px)"); // sm 사이즈 이하인 경우 모바일
  const { toast } = useToast();
  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "http://localhost:3000";

  // 모바일 네이티브 공유
  const handleMobileShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Share link",
          text: "Check out this awesome page!",
          url: currentUrl,
        })
        .then(() => {
          console.log("Thanks for sharing!");
        })
        .catch(console.error);
    } else {
      alert("Sharing is not supported in this browser.");
    }
  };

  // 데스크탑에서는 링크 복사 기능
  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        toast({ variant: "default", title: "Link copied to clipboard " });
      })
      .catch(console.error);
  };

  return (
    <div>
      {isMobile ? (
        <Button
          variant="outline"
          onClick={handleMobileShare}
          className="bg-black text-white"
        >
          Share
        </Button>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="bg-black text-white border-none hover:bg-[#4a4a4a] hover:text-white flex items-center"
            >
              <span className="text-lg mr-1">
                <IoShareSocialOutline />
              </span>{" "}
              Share
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md dark">
            <DialogHeader>
              <DialogTitle className="text-white">Share link</DialogTitle>
              <DialogDescription>
                Anyone who has this link will be able to view this.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={currentUrl}
                  readOnly
                  className="dark text-white"
                />
              </div>
              <Button
                type="button"
                size="sm"
                className="px-3"
                onClick={handleCopyLink}
              >
                <span className="sr-only">Copy</span>
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <DialogFooter className="justify-start">
              <DialogClose asChild > 
                <Button type="button" variant="secondary" >
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
