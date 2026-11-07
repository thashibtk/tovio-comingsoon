export default function SetupNotice({ message }: { message: string }) {
  return (
    <div className="notice">
      <p>{message}</p>
    </div>
  );
}
