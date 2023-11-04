// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

contract LicenseAdministrator is AccessControl {
    error LicenseAdministrator__YouAreNotAnAdmin();
    error LicenseAdministrator__YouCantUnlicense();
    error LicenseAdministrator__IsAlreadyAdmin();
    error LicenseAdministrator__IsAlreadyRevoked();
    error LicenseAdministrator__YouCantRevokeYourself();

    bytes32 public constant ADMIN_ROLE = keccak256("LICENSE_ADMIN_ROLE");
    
    mapping(address gmFamContractAddress => bool licenseStatus) public licenseStatuses;

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "LicenseAdministrator__YouAreNotTheOwner");
        _;
    }

    constructor(address _adminAddress) {
        _grantRole(ADMIN_ROLE, _adminAddress);
    }

    function grantAdminRole(address _newAdmin) public onlyAdmin {
        if (hasRole(ADMIN_ROLE, _newAdmin)) {
            revert LicenseAdministrator__IsAlreadyAdmin();
        }
        _grantRole(ADMIN_ROLE, _newAdmin);
    }

    function revokeAdminRole(address _admin) public onlyAdmin {
        if (_admin == msg.sender) {
            revert LicenseAdministrator__YouCantRevokeYourself();
        }
        if (!hasRole(ADMIN_ROLE, _admin)) {
            revert LicenseAdministrator__IsAlreadyRevoked();
        }
        _revokeRole(ADMIN_ROLE, _admin);
    }

    function grantLicense(address _gmFamContractAddress) public onlyAdmin {
        licenseStatuses[_gmFamContractAddress] = true;
    }

    function checkIfIsLicensed(address _gmFamContractAddress) public view returns (bool) {
        return licenseStatuses[_gmFamContractAddress];
    }
}

