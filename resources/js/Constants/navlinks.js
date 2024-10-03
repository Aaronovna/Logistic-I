////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbLayoutDashboard } from "react-icons/tb";
import { TbClipboardList } from "react-icons/tb";

export const analyticsLinks = [
    {
        name: 'dashboard',
        Icon: TbLayoutDashboard
    },
    {
        name: 'report',
        Icon: TbClipboardList
    }
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbArrowBarUp } from "react-icons/tb";
import { TbArrowBarToDown } from "react-icons/tb";
import { TbBuildingWarehouse } from "react-icons/tb";
import { TbPackage } from "react-icons/tb";
import { TbCategory } from "react-icons/tb";

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
    {
        name: 'category',
        Icon: TbCategory
    },
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbDesk } from "react-icons/tb";

export const auditLinks = [
    {
        name: 'depot',
        Icon: TbDesk
    },
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbHomeCog } from "react-icons/tb";
import { TbBus } from "react-icons/tb";

export const infrastructureLinks = [
    {
        name: 'depot',
        Icon: TbHomeCog
    },
    {
        name: 'terminal',
        Icon: TbBus
    }
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbUserCog } from "react-icons/tb";

export const managementLinks = [
    {
        name: 'user',
        Icon: TbUserCog
    },
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////