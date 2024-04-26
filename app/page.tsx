"use client";

import { useState } from "react";
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

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFetchJsonData = async () => {
    fetch("https://jsonplaceholder.typicode.com/todos/1")
      .then((response) => {
        setLoading(true);
        return response.json();
      })
      .then((json) => {
        console.log(json);
        setLoading(false);
        handleOpen();
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  return (
    <>
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "whitesmoke",
        }}
      >
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: 400,
          }}
        >
          <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search Blockchain" />
          <IconButton
            type="button"
            sx={{ p: "10px" }}
            aria-label="search"
            onClick={handleFetchJsonData}
          >
            <SearchIcon />
          </IconButton>
        </Paper>
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
              gap: "20px",
            }}
          >
            <Button
              sx={{ display: "flex", gap: "10px", fontSize: "20px" }}
              onClick={handleClose}
            >
              Bitcoin
              <Image
                alt="bitcoin icon"
                width={25}
                height={25}
                src="/images/bitcoin-logo-colored.svg"
              />
            </Button>

            <Button
              sx={{ display: "flex", gap: "10px", fontSize: "20px" }}
              onClick={handleClose}
            >
              Ethereum
              <Image
                alt="bitcoin icon"
                width={25}
                height={25}
                src="/images/ethereum-colored.svg"
              />
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
