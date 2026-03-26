import { IconPhotoOff } from "@tabler/icons-react";

const ImagePlaceholder = ({ size = 48 }: { size?: number }) => (
  <div className="flex items-center justify-center w-full h-full">
    <IconPhotoOff size={size} stroke={1.5} className="text-neutral-300" />
  </div>
);

export default ImagePlaceholder;
