import { useState } from "react";
import { splitStringByFirstDot } from "@/helpers/splitStringByFirstDot";

export const useDomains = ({ domain }: { domain: string }) => {
  const [child, setChild] = useState<string>("");
  const [parent, setParent] = useState<string>("");

  const onSetDomains = async () => {
    if (domain) {
      try {
        const [child, parent] = splitStringByFirstDot(domain);
        setChild(child);
        setParent(parent);
      } catch (e) {
        console.log(e);
      }
    }
  };

  return { child, parent, onSetDomains };
};
