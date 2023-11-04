import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { FaBars } from "react-icons/fa6";
import { ConnectButton } from "@rainbow-me/rainbowkit";

type HamburgerMenuProps = {
  numberBlocker: number;
};

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ numberBlocker }) => {
  return (
    <>
    <div style={{
      display: "flex",
      alignContent: "center",
      justifyContent: "center",
      
    }}>
      <div
        style={{
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
          marginRight: "1vw",
          marginLeft: "auto",

        }}
      >
      <ConnectButton 
       
        showBalance={{
          smallScreen: false,
          largeScreen: false,
        }}
        chainStatus={{
          smallScreen: 'icon',
          largeScreen: 'full',
        }}
      
      />
      </div>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<FaBars />}
          colorScheme="green"
        />
        <MenuList>
          <MenuItem
            onClick={() => numberBlocker != 1 && (window.location.href = "/")}
            backgroundColor={numberBlocker === 1 ? "gray.500" : ""}
            color={numberBlocker === 1 ? "white" : ""}
          >
            Create gm Fam!
          </MenuItem>
          <MenuItem
            onClick={() =>
              numberBlocker != 2 && (window.location.href = "/mint")
            }
            backgroundColor={numberBlocker === 2 ? "gray.500" : ""}
            color={numberBlocker === 2 ? "white" : ""}
          >
            Wrap &amp; Mint NFT
          </MenuItem>
          <MenuItem
            onClick={() =>
              numberBlocker != 3 && (window.location.href = "/goBack")
            }
            backgroundColor={numberBlocker === 3 ? "gray.500" : ""}
            color={numberBlocker === 3 ? "white" : ""}
          >
            Go back to the Original Collection
          </MenuItem>
          <MenuItem
            onClick={() =>
              numberBlocker != 4 && (window.location.href = "/adminPanel")
            }
            backgroundColor={numberBlocker === 4 ? "gray.500" : ""}
            color={numberBlocker === 4 ? "white" : ""}
          >
            Admin panel
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
    </>
  );
};

export default HamburgerMenu;
