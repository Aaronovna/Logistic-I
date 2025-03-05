////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbLayoutDashboard } from "react-icons/tb";
//import { TbClipboardList } from "react-icons/tb";

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
import { TbRecycle } from "react-icons/tb";
import { TbBuildingCog } from "react-icons/tb";

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
        name: 'return',
        Icon: TbRecycle
    },
    {
        name: 'category',
        Icon: TbCategory
    },
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbPinned } from "react-icons/tb";
import { TbCheckbox } from "react-icons/tb";
import { TbClipboardData } from "react-icons/tb";

export const auditLinks = [
    {
        name: 'tasks',
        Icon: TbCheckbox
    },
    {
        name: ['reports', 'reports-view', 'reports-history'],
        Icon: TbClipboardData
    },
    {
        name: ['assignments', 'assignments-view', 'assignments-history'],
        Icon: TbPinned
    },
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbHomeCog } from "react-icons/tb";
import { TbBus } from "react-icons/tb";

export const infrastructureLinks = [
    {
        name: ['depot', 'depot-history'],
        Icon: TbHomeCog
    },
    {
        name: ['terminal', 'terminal-history'],
        Icon: TbBus
    },
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

import { TbUserCog } from "react-icons/tb";
import { TbCategory } from "react-icons/tb";
import { TbPuzzle } from "react-icons/tb";
import { TbLogs } from "react-icons/tb";

export const managementLinks = [
    {
        name: 'user',
        Icon: TbUserCog
    },
    {
        name: ['infrastructure', 'infrastructure-view'],
        Icon: TbBuildingCog
    },
    /* {
        name: 'module',
        Icon: TbPuzzle
    }, */
    {
        name: 'logs',
        Icon: TbLogs
    },
];

export const managementLinks2 = [
    {
        name: 'user',
        Icon: TbUserCog
    },
    {
        name: ['infrastructure', 'infrastructure-view'],
        Icon: TbBuildingCog
    },
];

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

export const superAdminPages = [
    'dashboard', /* 'report', */ 'receipt', 'dispatch', 'warehouse', 'product', 'category',
    'depot', 'terminal',
    'tasks', 'reports', 'assignments',
    'user', 'infrastructure', 'logs', /* 'module' */,
]

export const adminPages = [
    'dashboard', /* 'report', */ 'receipt', 'dispatch', 'warehouse', 'product', 'category',
    'depot', 'terminal',
    'tasks', 'reports', 'assignments',
    'user', 'infrastructure',
]

export const inventoryPages = [
    'dashboard', /* 'report', */ 'receipt', 'dispatch', 'warehouse', 'product', 'return', 'category',
]

export const infrastructurePages = [
    'depot', 'terminal',
]

export const auditPages = [
    'tasks', 'reports', 'assignments',
]