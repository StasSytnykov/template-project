import { useState } from "react";
import { splitStringByFirstDot } from "@/helpers/splitStringByFirstDot";
import { useDomains } from "@/hooks/useDomains";

export const useEth = ({
  contract,
  domain,
  provider,
}: {
  contract: any;
  domain: string;
  provider: any;
}) => {
  const { parent, child } = useDomains({ domain });

  const onBuyChild = async () => {
    const price = await contract.getRegistrationPriceInEth();

    const buyChildDomainTransaction = await contract.buyChildDomainViaEth(
      parent,
      child,
      {
        value: price,
      },
    );
    console.log(buyChildDomainTransaction);
  };

  const onBuyParent = async () => {
    const signer = await provider.getSigner();
    const price = await contract.getRegistrationPriceInEth();

    console.log("parent");

    try {
      const buyDomainTransaction = await contract
        .connect(signer)
        .buyDomainViaEth(domain, {
          value: price,
        });
      console.log(buyDomainTransaction);
    } catch (error) {
      console.log(error);
    }
  };

  return { onBuy: child && parent ? onBuyChild : onBuyParent };
};
