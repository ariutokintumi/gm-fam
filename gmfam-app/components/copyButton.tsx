import clipboardCopy from "clipboard-copy";
import { Button } from "@chakra-ui/react";
import { FaRegClipboard } from "react-icons/fa6";
import toast, { Toaster } from "react-hot-toast";

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const handleCopyClick = async () => {
    try {
      await clipboardCopy(text);
      toast.success(`Copied to clipboard`, {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      toast.error(`Error to copy the text`, {
        duration: 3000,
        position: "top-right",
      });
      console.error("Error to copy the text:", error);
    }
  };
  return (
    <Button onClick={handleCopyClick} size="sm">
      <FaRegClipboard />
    </Button>
  );
};

export default CopyButton;
