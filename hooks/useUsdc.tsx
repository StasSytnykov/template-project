import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { USDC_ABI } from "@/const/const";
import { useDomains } from "@/hooks/useDomains";

const CONTRACT_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export const useUsdc = ({
  signer,
  contract,
  domain,
  provider,
}: {
  provider: any;
  signer: any;
  contract: any;
  domain: string;
}) => {
  const [usdcContract, setUsdcContract] = useState<any>(null);

  const { parent, child } = useDomains({ domain });

  useEffect(() => {
    if (signer) {
      setUsdcContract(
        new ethers.Contract(CONTRACT_ADDRESS, USDC_ABI.abi, signer),
      );
    }
  }, [signer]);

  const onApprovePrice = async () => {
    const price = contract.getRegistrationPriceInUsdc();

    try {
      if (price) {
        const response = await usdcContract.approve(contract.target, price);
        await response.wait();
        console.log({ response });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onBuyChild = async () => {
    const price = contract.getRegistrationPriceInUsdc();

    await onApprovePrice();

    try {
      const response = await contract.buyChildDomainViaUsdc(parent, child, {
        value: price,
      });
      await response.wait();
      console.log({ response });
    } catch (e) {
      console.log(e);
    }
  };

  const onBuyParent = async () => {
    const signer = await provider.getSigner();
    const price = await contract.getRegistrationPriceInUsdc();

    await onApprovePrice();

    try {
      const buyDomainTransaction = await contract
        .connect(signer)
        .buyDomainViaUsdc(domain, {
          value: price,
        });
      await buyDomainTransaction.wait();
      console.log(buyDomainTransaction);
    } catch (error: any) {
      console.dir(error);
      alert("Influence money");
    }
  };

  return { onBuyUsdc: child && parent ? onBuyChild : onBuyParent };
};
