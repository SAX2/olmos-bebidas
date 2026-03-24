const ImagePlaceholder = () => (
  <div className="flex items-center justify-center w-full h-full">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-12 text-neutral-300"
    >
      <path d="M10 2h4v3h-4z" />
      <path d="M10 5v1.5c0 .5-.5 1.5-1.5 2.5S7 11 7 12.5V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7.5c0-1.5-.5-2.5-1.5-3.5S14 7 14 6.5V5" />
      <path d="M7 15h10" />
    </svg>
  </div>
);

export default ImagePlaceholder;
