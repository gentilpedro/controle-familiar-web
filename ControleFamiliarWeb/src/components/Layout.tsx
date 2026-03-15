import type { ReactNode } from "react";
import Navbar from "./Navbar";

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {

  return (
    <div>

      <Navbar />

      <div style={{ padding: "20px" }}>
        {children}
      </div>

    </div>
  );

}