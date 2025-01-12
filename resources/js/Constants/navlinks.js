////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbLayoutDashboard } from "react-icons/tb";
import { TbClipboardList } from "react-icons/tb";

export const analyticsLinks = [
    {
        name: 'dashboard',
        Icon: TbLayoutDashboard
    },
    /* {
        name: 'report',
        Icon: TbClipboardList
    } */
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbArrowBarUp } from "react-icons/tb";
import { TbArrowBarToDown } from "react-icons/tb";
import { TbBuildingWarehouse } from "react-icons/tb";
import { TbPackage } from "react-icons/tb";

export const inventoryLinks = [
    {
        name: ['receipt', 'receipt-history'],
        Icon: TbArrowBarUp
    },
    {
        name: 'dispatch',
        Icon: TbArrowBarToDown
    },
    {
        name: 'warehouse',
        Icon: TbBuildingWarehouse
    },
    {
        name: 'product',
        Icon: TbPackage
    },
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbUserSearch } from "react-icons/tb";
import { TbListSearch } from "react-icons/tb";

export const auditLinks = [
    {
        name: 'audits',
        Icon: TbListSearch
    },
    {
        name: 'auditors',
        Icon: TbUserSearch
    },
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbHomeCog } from "react-icons/tb";
import { TbBus } from "react-icons/tb";

export const infrastructureLinks = [
    {
        name: ['depot', 'depot-inventory', 'depot-maintenance'],
        Icon: TbHomeCog
    },
    {
        name: ['terminal', 'terminal-request'],
        Icon: TbBus
    },
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbUserCog } from "react-icons/tb";
import { TbCategory } from "react-icons/tb";
import { TbBuildingCog } from "react-icons/tb";
import { TbPuzzle } from "react-icons/tb";

export const managementLinks = [
    {
        name: 'user',
        Icon: TbUserCog
    },
    {
        name: 'category',
        Icon: TbCategory
    },
    {
        name: 'infrastructure',
        Icon: TbBuildingCog
    },
    {
        name: 'module', 
        Icon: TbPuzzle
    },
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////