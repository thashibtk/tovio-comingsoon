import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
