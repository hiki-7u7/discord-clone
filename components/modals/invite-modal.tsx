"use client";

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useModal } from '@/hooks/use-modal-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { useOrigin } from '@/hooks/use-origin';
import axios from 'axios';


export const InviteModal = () => {

  const { isOpen, type, onClose, data, onOpen } = useModal();
  const origin = useOrigin();

  const isModalOpen = isOpen && type === "invite"
  const { server } = data;

  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const [copied, setCopied] = useState(false);
  const [isloading, setIsloading] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);

    setTimeout(()=> {
      setCopied(false)
    }, 1000)
  }

  const onNew = async () => {
    try {
      setIsloading(true);
      const response = await axios.patch(`/api/servers/${server?.id}/invite-code`)
      
      onOpen("invite", { server: response.data })
    } catch (error) {
      console.log(error);
    } finally {
      setIsloading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent 
        className="
          bg-white 
          text-black 
          p-0 
          overflow-hidden
        "
      >
        <DialogHeader className="pt-8 px-6">
          <DialogTitle
            className="
              text-2xl 
              text-center 
              font-bold
            "
          >
            Invite Friends
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Label 
            className="
              uppercase 
              text-xs 
              font-bold 
              text-zinc-500 
              dark:text-secondary/70
            ">
            Server invite link
          </Label>
          <div
            className="
            flex
            items-center
            mt-2
            gap-x-2"
          >
            <Input
              readOnly
              disabled={isloading}
              className="
              bg-zinc-300/50 
              border-0 
              focus-visible:ring-0
              text-black
              focus-visible:ring-offset-0"
              value={inviteUrl}
            />
            <Button
              disabled={isloading}
              size="icon"
              onClick={onCopy}
            >
              {copied
                ? <Check className="h-4 w-4"/>
                : <Copy className="h-4 w-4"/>
              }
              
            </Button>
          </div>
          <Button
            onClick={onNew}
            disabled={isloading}
            variant="link"
            size="sm"
            className="text-xs text-zinc-500 mt-4"
          >
            Generate a new link
            <RefreshCw className="h-4 w-4 mr-2"/>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
