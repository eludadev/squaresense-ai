export default function CurvedArrowBottomLeft({
  ...props
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 7H6C12.6274 7 18 12.3726 18 19V19M4 7L7 4M4 7L7 10"></path>
    </svg>
  );
}
