export type SiteIconKind =
  | "worker"
  | "agent"
  | "employer"
  | "signin"
  | "profile"
  | "search"
  | "message"
  | "map"
  | "trades"
  | "phone"
  | "brand"
  | "check"
  | "crew";

export default function SiteIcon({
  kind,
  className,
}: {
  kind: SiteIconKind;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths(kind)}
    </svg>
  );
}

function paths(kind: SiteIconKind) {
  switch (kind) {
    case "worker":
      return (
        <>
          <path d="M8 10V8.5A4 4 0 0 1 12 4.5 4 4 0 0 1 16 8.5V10" />
          <path d="M5 10h14v2.2c0 2.4-1.4 4.5-3.5 5.5L14 21h-4l-1.5-3.3C6.4 16.7 5 14.6 5 12.2V10z" />
          <path d="M9 14h6" />
        </>
      );
    case "agent":
      return (
        <>
          <circle cx="9" cy="8" r="2.5" />
          <circle cx="16" cy="9" r="2.2" />
          <path d="M3.5 18.5c.6-2.4 2.8-4 5.5-4s4.9 1.6 5.5 4" />
          <path d="M13.5 18.5c.4-1.5 1.5-2.7 3-3.2 1.5.4 2.7 1.5 3.2 3.2" />
        </>
      );
    case "employer":
      return (
        <>
          <circle cx="10.5" cy="10.5" r="5.5" />
          <path d="M15 15l5 5" />
        </>
      );
    case "signin":
      return (
        <>
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
        </>
      );
    case "profile":
      return (
        <>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19.5c1.2-3 3.5-4.5 6.5-4.5s5.3 1.5 6.5 4.5" />
        </>
      );
    case "search":
      return (
        <>
          <circle cx="11" cy="11" r="6" />
          <path d="M20 20l-3.5-3.5" />
        </>
      );
    case "message":
      return (
        <>
          <path d="M4.5 6.5h15v9.2a1.8 1.8 0 0 1-1.8 1.8H9.2L4.5 21V6.5z" />
          <path d="M8 10.5h8M8 13.5h5" />
        </>
      );
    case "map":
      return (
        <>
          <path d="M9 4.5 3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5 9 4.5z" />
          <path d="M9 4.5v13M15 6.5v13" />
        </>
      );
    case "trades":
      return (
        <>
          <path d="M14.5 4.5 19 9l-8.5 8.5H6v-4.5L14.5 4.5z" />
          <path d="M12.5 6.5 17 11" />
          <path d="M4.5 19.5h15" />
        </>
      );
    case "phone":
      return (
        <>
          <path d="M8.2 4.5h2.6l1.2 3.2-1.6 1.2a10.5 10.5 0 0 0 4.7 4.7l1.2-1.6 3.2 1.2v2.6c0 .9-.7 1.7-1.6 1.7A13.5 13.5 0 0 1 4.5 6.1c0-.9.8-1.6 1.7-1.6z" />
        </>
      );
    case "brand":
      return (
        <>
          <path d="M4.5 18.5 12 4.5l7.5 14H4.5z" />
          <path d="M9.2 18.5 12 12.5l2.8 6" />
        </>
      );
    case "check":
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M8.5 12.2 11 14.7 15.5 9.5" />
        </>
      );
    case "crew":
      return (
        <>
          <circle cx="8" cy="9" r="2.4" />
          <circle cx="16" cy="9" r="2.4" />
          <circle cx="12" cy="7.5" r="2.6" />
          <path d="M3.8 18.5c.7-2.3 2.6-3.7 5-3.7.7 0 1.4.1 2 .4" />
          <path d="M13.2 15.2c.6-.3 1.3-.4 2-.4 2.4 0 4.3 1.4 5 3.7" />
          <path d="M8.2 18.5c.6-2 2.2-3.2 3.8-3.2s3.2 1.2 3.8 3.2" />
        </>
      );
  }
}
