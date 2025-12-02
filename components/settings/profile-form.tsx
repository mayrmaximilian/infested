"use client";

import React from "react";
import NextImage from "next/image";
import { updateProfileAction } from "@/app/actions/profile";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Props = {
  userId: string;
  name?: string | null;
  role?: "gamer" | "developer" | null;
  avatarUrl?: string | null;
};

const initialState = undefined;

export function ProfileForm({ userId, name, role, avatarUrl }: Props) {
  const [state, formAction] = React.useActionState(updateProfileAction, initialState);
  const [baseName, setBaseName] = React.useState(name ?? "");
  const [baseRole, setBaseRole] = React.useState<"gamer" | "developer">(
    role === "developer" ? "developer" : "gamer"
  );
  const [baseAvatar, setBaseAvatar] = React.useState(avatarUrl ?? "");

  const [nameValue, setNameValue] = React.useState(baseName);
  const [roleValue, setRoleValue] = React.useState<"gamer" | "developer">(baseRole);
  const [isPending, startTransition] = React.useTransition();
  const [avatarValue, setAvatarValue] = React.useState(avatarUrl ?? "");
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const supabase = React.useMemo(() => createClient(), []);
  const [dragActive, setDragActive] = React.useState(false);
  const [showCrop, setShowCrop] = React.useState(false);
  const [cropFile, setCropFile] = React.useState<File | null>(null);
  const [cropPreview, setCropPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    setBaseName(name ?? "");
    setBaseRole(role === "developer" ? "developer" : "gamer");
    setBaseAvatar(avatarUrl ?? "");
    setNameValue(name ?? "");
    setRoleValue(role === "developer" ? "developer" : "gamer");
    setAvatarValue(avatarUrl ?? "");
  }, [name, role, avatarUrl]);

  React.useEffect(() => {
    if (state?.success) {
      setBaseName(nameValue);
      setBaseRole(roleValue);
      setBaseAvatar(avatarValue);
    }
  }, [state?.success, nameValue, roleValue, avatarValue]);

  const cropToSquare = (file: File): Promise<{ blob: Blob; ext: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not prepare canvas context."));
            return;
          }
          ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Could not create image blob."));
                return;
              }
              const ext = file.type.split("/")[1] || "jpg";
              resolve({ blob, ext });
            },
            file.type || "image/jpeg",
            0.92
          );
        };
        img.onerror = () => reject(new Error("Failed to load image for cropping."));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });
  };

  const extractPathFromUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split("/");
      const bucketIndex = parts.findIndex((p) => p === "avatars");
      if (bucketIndex !== -1 && parts[bucketIndex + 1]) {
        return parts.slice(bucketIndex + 1).join("/");
      }
      return null;
    } catch {
      return null;
    }
  };

  const uploadFile = async (file: File) => {
    // Limit to 1MB to align with bucket config and keep the UI responsive.
    if (file.size > 1 * 1024 * 1024) {
      setUploadError("Please choose an image under 1MB.");
      return null;
    }

    setUploading(true);
    setUploadError(null);

    let cropped;
    try {
      cropped = await cropToSquare(file);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to crop image.");
      setUploading(false);
      return null;
    }

    const path = `${userId}/${Date.now()}.${cropped.ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, cropped.blob, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "image/jpeg",
      });

    if (uploadError) {
      setUploadError(uploadError.message);
      setUploading(false);
      return null;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = data.publicUrl?.replace(/\/avatars\/(?:avatars\/)+/, "/avatars/");
    const previousPath = avatarValue ? extractPathFromUrl(avatarValue) : null;
    setAvatarValue(publicUrl ?? "");

    // Cleanup old avatar in background if it existed.
    if (previousPath) {
      void supabase.storage.from("avatars").remove([previousPath]);
    }

    setUploading(false);
    return data.publicUrl ?? null;
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCropFile(file);
      setCropPreview(previewUrl);
      setShowCrop(true);
    }
  };

  const closeCrop = () => {
    if (cropPreview) URL.revokeObjectURL(cropPreview);
    setCropPreview(null);
    setCropFile(null);
    setShowCrop(false);
  };

  const confirmCrop = async () => {
    if (!cropFile) return;
    const newUrl = await uploadFile(cropFile);
    if (newUrl) {
      const normalized = newUrl.replace(/\/avatars\/(?:avatars\/)+/, "/avatars/");
      setAvatarValue(normalized);
      closeCrop();
      const fd = new FormData();
      fd.append("name", nameValue);
      fd.append("role", roleValue);
      fd.append("avatarUrl", normalized);
      startTransition(() => {
        formAction(fd);
      });
    }
  };

  const normalizedBaseAvatar = baseAvatar.replace(/\/avatars\/(?:avatars\/)+/, "/avatars/");
  const normalizedAvatar = avatarValue.replace(/\/avatars\/(?:avatars\/)+/, "/avatars/");

  const isChanged =
    nameValue !== baseName || roleValue !== baseRole || normalizedAvatar !== normalizedBaseAvatar;

  return (
    <>
      <Card className="border-[#1f2128] bg-[#0b0d12]">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your display info and role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startTransition(() => {
                formAction(fd);
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                name="name"
                value={nameValue}
                minLength={2}
                maxLength={50}
                required
                onChange={(e) => setNameValue(e.target.value)}
              />
            </div>

            <input type="hidden" name="avatarUrl" value={avatarValue} />
            <div className="space-y-3">
              <Label>Profile picture</Label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-[#1f2128] bg-white/5">
                  {avatarValue ? (
                    <NextImage
                      src={avatarValue}
                      alt="Current avatar"
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#0a0b0f] text-sm font-semibold text-white/70">
                      {nameValue.slice(0, 2).toUpperCase() || "AV"}
                    </div>
                  )}
                </div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "flex min-h-24 min-w-[240px] flex-1 cursor-pointer items-center justify-center rounded-md border border-dashed px-4 text-sm transition",
                    dragActive ? "border-[#D946EF] bg-white/5" : "border-[#1f2128] bg-[#0a0b0f]",
                    uploading && "opacity-70"
                  )}
                >
                  <div className="text-center space-y-2">
                    <p className="font-medium text-white">
                      {uploading ? "Uploading..." : "Drag & drop to upload"}
                    </p>
                    <p className="text-xs text-white/60">PNG, JPG up to 1MB.</p>
                  </div>
                </div>
              </div>
              {avatarValue ? (
                <p className="text-xs text-white/60">Avatar updated</p>
              ) : (
                <p className="text-xs text-white/50">Upload an image to set your avatar.</p>
              )}
              {uploadError ? (
                <p className="text-xs text-red-300">Upload failed: {uploadError}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Account type</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-md border border-[#1f2128] bg-[#0a0b0f] px-3 py-2 text-sm text-white/80">
                  <input
                    type="radio"
                    name="role"
                    value="gamer"
                    checked={roleValue === "gamer"}
                    className="h-4 w-4 accent-[#D946EF]"
                    onChange={() => setRoleValue("gamer")}
                  />
                  <div>
                    <p className="font-medium text-white">Gamer</p>
                    <p className="text-xs text-white/60">Play, follow drops, and build your library.</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-md border border-[#1f2128] bg-[#0a0b0f] px-3 py-2 text-sm text-white/80">
                  <input
                    type="radio"
                    name="role"
                    value="developer"
                    checked={roleValue === "developer"}
                    className="h-4 w-4 accent-[#D946EF]"
                    onChange={() => setRoleValue("developer")}
                  />
                  <div>
                    <p className="font-medium text-white">Developer</p>
                    <p className="text-xs text-white/60">Publish builds, manage playtests, reach players.</p>
                  </div>
                </label>
              </div>
              <p className="text-xs text-white/50">You can change this anytime.</p>
            </div>

            {state?.error ? (
              <div className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {state.error}
              </div>
            ) : null}
            {state?.success ? (
              <div className="rounded-md border border-[#22D3EE]/40 bg-[#22D3EE]/10 px-3 py-2 text-sm text-[#a5f3fc]">
                {state.success}
              </div>
            ) : null}

            <Separator />
            <Button type="submit" className="w-full" disabled={!isChanged || isPending}>
              {isPending ? "Saving..." : isChanged ? "Save profile" : "Saved"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {showCrop && cropPreview && cropFile ? (
        <CropModal
          previewUrl={cropPreview}
          onCancel={closeCrop}
          onConfirm={confirmCrop}
          uploading={uploading}
        />
      ) : null}
    </>
  );
}

function CropModal({
  previewUrl,
  onCancel,
  onConfirm,
  uploading,
}: {
  previewUrl: string;
  onCancel: () => void;
  onConfirm: () => void;
  uploading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-xl border border-[#1f2128] bg-[#0b0d12] p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">Crop to square</h2>
        <p className="text-sm text-white/60">
          We&apos;ll crop the shortest side to keep your avatar square.
        </p>
        <div className="mt-4 flex justify-center">
          <div className="relative h-64 w-64 overflow-hidden rounded-lg border border-[#1f2128] bg-black/40">
            <NextImage
              src={previewUrl}
              alt="Crop preview"
              fill
              sizes="256px"
              className="object-cover"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={uploading}>
            {uploading ? "Uploading..." : "Crop & upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}
