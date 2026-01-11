"use client";

import { ModalForm } from "@/components/modal-form";
import { useOverlayQueue } from "@/components/overlay/overlay-context";
import { useCallback } from "react";

interface ConfirmOptions {
  title?: string;
  actionLabel?: string;
  loadingLabel?: string;
}

export function useConfirm() {
  const overlayQueue = useOverlayQueue();

  const confirm = useCallback(
    async (message: string, options: ConfirmOptions = {}): Promise<boolean> => {
      const { title = "确认操作", actionLabel = "确认", loadingLabel = "处理中..." } = options;

      return new Promise((resolve) => {
        let isResolved = false;

        const overlayRef = overlayQueue.show(
          <ModalForm
            title={title}
            onSubmit={(e) => {
              e.preventDefault();
              if (!isResolved) {
                isResolved = true;
                overlayRef.close();
                resolve(true);
              }
            }}
            submitLabel={actionLabel}
            loadingLabel={loadingLabel}
            maxWidth="max-w-sm"
            onClose={() => {
              if (!isResolved) {
                isResolved = true;
                resolve(false);
              }
            }}
          >
            <p className="text-muted-foreground">{message}</p>
          </ModalForm>,
        );
      });
    },
    [overlayQueue],
  );

  return confirm;
}
