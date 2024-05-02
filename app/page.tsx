"use client";

import { useCallback, useEffect, useState } from "react";
import { BrowserProvider, ethers, JsonRpcSigner } from "ethers";
import Image from "next/image";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import DialogTitle from "@mui/material/DialogTitle";
import { DomainRegistry } from "@/const/const";
import { useEth } from "@/hooks/useEthHook";
import { splitStringByFirstDot } from "@/helpers/splitStringByFirstDot";
import { validateAddress } from "@/helpers/validateAddress";
import { useUsdc } from "@/hooks/useUsdc";
import { useDomains } from "@/hooks/useDomains";
import { UserFunds } from "@/components/UserFunds";
import { transformEther } from "@/helpers/transformEther";
import { transformUsdc } from "@/helpers/transformUsdc";

declare global {
  interface Window {
    ethereum: any;
  }
}

const CONTRACT_ADDRESS = "0xcCd898F439a9FE6827681bB583EeF345E1ebFbaa";

export interface IWeb3State {
  address: string | null;
  currentChain: number | null;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  isAuthenticated: boolean;
}

export default function Home() {
  const [value, setValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [domainMessage, setDomainMessage] = useState<string>("");
  const [contract, setContract] = useState<any>(null);
  const [isCanBuyDomain, setIsCanBuyDomain] = useState<boolean>(false);
  const [priceEth, setPriceEth] = useState<string>("");
  const [priceUsdc, setPriceUsdc] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isChildDomain, setIsChildDomain] = useState<boolean>(false);
  const [myDomains, setMyDomains] = useState<
    { domain: string; blockNumber: number }[]
  >([]);

  const initialWeb3State = {
    address: null,
    currentChain: null,
    signer: null,
    provider: null,
    isAuthenticated: false,
  };
  const [state, setState] = useState<IWeb3State>(initialWeb3State);
  const { onBuy } = useEth({
    contract,
    domain: value,
    provider: state.provider,
  });
  const { onSetDomains } = useDomains({ domain: value });

  const { onBuyUsdc } = useUsdc({
    signer: state.signer,
    contract,
    domain: value,
    provider: state.provider,
  });

  const connectWallet = useCallback(async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        return alert({
          status: "error",
          position: "top-right",
          title: "Error",
          description: "No ethereum wallet found",
        });
      }
      const provider = new ethers.BrowserProvider(ethereum);

      const accounts: string[] = await provider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const chain = Number(await (await provider.getNetwork()).chainId);

        setState({
          ...state,
          address: accounts[0],
          signer,
          currentChain: chain,
          provider,
          isAuthenticated: true,
        });

        localStorage.setItem("isAuthenticated", "true");
      }
    } catch {}
  }, [state]);

  useEffect(() => {
    if (state.signer) {
      setContract(
        new ethers.Contract(CONTRACT_ADDRESS, DomainRegistry.abi, state.signer),
      );
    }
  }, [state]);

  const greet = async () => {
    if (contract) {
      try {
        const priceUSDC = await contract.getRegistrationPriceInUsdc();
        const priceETH = await contract.getRegistrationPriceInEth();

        setPriceEth(transformEther(priceETH));
        setPriceUsdc(priceUSDC.toString());
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    await greet();
    await onSetDomains();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (event: any) => {
    setValue(event.target.value);
  };

  const handleSearchDomain = async (event: any) => {
    event.preventDefault();

    if (value) {
      try {
        const [, parent] = splitStringByFirstDot(value);

        if (parent) {
          const isExistingParentDomain = validateAddress(
            await contract.getDomainOwner(parent),
          );

          if (!isExistingParentDomain) {
            setDomainMessage(`This  ${parent} domain is not existing`);
            setIsCanBuyDomain(false);
            setIsChildDomain(true);
            return;
          }
        }

        const domainOwner = await contract.getDomainOwner(value);

        const isNotAvailableDomain = validateAddress(domainOwner);
        if (isNotAvailableDomain) {
          setDomainMessage(
            `This  ${value} domain is already taken by ${domainOwner}`,
          );
          setIsCanBuyDomain(false);
          return;
        }

        setIsCanBuyDomain(true);
        setIsChildDomain(false);
        setDomainMessage(`This  ${value} domain is available`);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (state.address && contract) {
      (async () => {
        const filter = contract.filters.DomainRegistered(null, state.address);

        const logs: any = await contract.queryFilter(filter);

        let array = [];

        for (let i = 0; i < logs.length; i++) {
          array.push(i);
        }

        const mapedArr = array.map((item) => {
          return {
            domain: logs[item].args[0],
            blockNumber: logs[item].blockNumber,
          };
        });

        setMyDomains(mapedArr);
      })();
    }
  }, [state.address, contract]);

  return (
    <>
      <main
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "whitesmoke",
          color: "black",
        }}
      >
        {state.isAuthenticated && (
          <UserFunds contract={contract} address={state.address as string} />
        )}

        <Button
          type="button"
          onClick={connectWallet}
          sx={{
            marginTop: "100px",
          }}
        >
          Connect wallet
        </Button>
        {state.isAuthenticated && (
          <Paper
            component="form"
            onSubmit={handleSearchDomain}
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: 400,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search Blockchain"
              onChange={handleInputChange}
              value={value}
            />
            <IconButton
              type="submit"
              sx={{ p: "10px" }}
              aria-label="search"
              disabled={!value}
            >
              <SearchIcon />
            </IconButton>
          </Paper>
        )}
        {domainMessage && <p style={{ color: "black" }}>{domainMessage}</p>}

        {isCanBuyDomain && (
          <Button type="button" onClick={handleOpen}>
            Buy now
          </Button>
        )}
        {myDomains.length >= 0 && state.isAuthenticated && (
          <div style={{ marginTop: "50px" }}>
            <h2>My domains:</h2>
            {myDomains.map(({ domain, blockNumber }) => (
              <div
                key={domain}
                style={{ display: "flex", alignItems: "center", gap: "50px" }}
              >
                <p>{domain}</p>
                <p>{blockNumber}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box sx={{ padding: "20px" }}>
          <DialogTitle id="alert-dialog-title" fontSize="30px">
            Choose your blockchain
          </DialogTitle>

          <DialogActions
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <Button
              sx={{ display: "flex", gap: "10px", fontSize: "20px" }}
              onClick={onBuyUsdc}
            >
              <Image
                alt="bitcoin icon"
                width={25}
                height={25}
                src="/images/usd-coin-usdc-logo.svg"
              />
              {priceUsdc && <p>{transformUsdc(priceUsdc)}</p>}
            </Button>

            <Button
              type="button"
              sx={{ display: "flex", gap: "10px", fontSize: "20px" }}
              onClick={onBuy}
            >
              <Image
                alt="bitcoin icon"
                width={25}
                height={25}
                src="/images/ethereum-colored.svg"
              />
              {priceEth && <p>{priceEth}</p>}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
