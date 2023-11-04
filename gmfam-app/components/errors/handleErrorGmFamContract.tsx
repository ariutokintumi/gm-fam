import toast, { Toaster } from "react-hot-toast";
import { ContractFunctionExecutionError, parseEther } from "viem";
const handleErrorGmFamContracts = (error: any) => {
    if (error instanceof ContractFunctionExecutionError) {
      if (error.message.includes("OwnableUnauthorizedAccount(address account)")) {
        toast.error("You are not the owner of this contract, please change your account", {
          duration: 2000,
          position: "top-right",
        });
      }else if (error.message.includes("GmFam__YouAreNotTheOwner()")) {
        toast.error("You are not the owner of this contract, please try again", {
          duration: 2000,
          position: "top-right",
        });
      } else if (error.message.includes("GmFam__YouMUSTPayForMint()")) {
        toast.error("You must pay for the mint, please try again", {
          duration: 2000,
          position: "top-right",
        });
      } else if (error.message.includes("GmFam__TransferFailed()")) {
        toast.error("You payment failed, please try again", {
          duration: 2000,
          position: "top-right",
        });
      } else if (error.message.includes("GmFam__MaxSupplyReached()")) {
        toast.error("Sorry, the max supply has been reached :(", {
          duration: 2000,
          position: "top-right",
        });
      } else if (error.message.includes("GmFam__CantDecreaseMaxSupply()")) {
        toast.error("Sorry, you can't decrease the max supply", {
          duration: 2000,
          position: "top-right",
        });
      } else if (error.message.includes("GmFam__NotEnoughFunds()")) {
        toast.error("Sorry, you don't have enough funds", {
          duration: 2000,
          position: "top-right",
        });
      } else {
        toast.error("There was an error in the function, please try again", {
          duration: 2000,
          position: "top-right",
        });
      }
    } else {
      toast.error("There was an error in the contract, please try again", {
        duration: 2000,
        position: "top-right",
      });
      console.error("Error:", error);
    }
    console.error("Error:", error);
  };

export default handleErrorGmFamContracts;