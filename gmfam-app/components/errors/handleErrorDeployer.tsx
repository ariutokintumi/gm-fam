import toast, { Toaster } from "react-hot-toast";
import { ContractFunctionExecutionError, parseEther } from "viem";

const handleErrorDeployer = (error: any) => {
    if (error instanceof ContractFunctionExecutionError) {
      if (error.message.includes("DeployerGmFam__NotEnoughEthSentToPayForDeployment()")) {
        toast.error("You must pay 0.02 ETH for the deployment, please try again", {
          duration: 2000,
          position: "top-right",
        });
      } else if (error.message.includes("DeployerGmFam__PaymentFailed()")) {
        toast.error("Payment failed, please try again", {
          duration: 2000,
          position: "top-right",
        });
      } else {
        toast.error("There was an error, please try again", {
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

export default handleErrorDeployer;