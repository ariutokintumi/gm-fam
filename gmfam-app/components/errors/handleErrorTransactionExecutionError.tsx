import toast, { Toaster } from "react-hot-toast";
import { TransactionExecutionError, parseEther } from "viem";
const handleErrorTransactionExecutionError = (error: any) => {
  if (error instanceof TransactionExecutionError) {
    if (error.message.includes("User rejected the request")) {
      toast.error("You rejected the transaction", {
        position: "top-right",
      });
    } else {
      toast.error("There was an error in the function, please try again", {
        position: "top-right",
      });
    }
  } else {
    toast.error("There was an error in the contract, please try again", {
      position: "top-right",
    });
  }
  console.error("Error:", error);
};

export default handleErrorTransactionExecutionError;
