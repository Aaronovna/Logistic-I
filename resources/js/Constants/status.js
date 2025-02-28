export const getStatusStep = (array = [], status = "") => {
    const index = array.findIndex(item => item.name.toLowerCase().trim() === status.toLowerCase().trim());
    return index !== -1 ? index + 1 : 0;
};


export const auditTaskStatus = [
    {
        name: 'Pending',
        color: 'bg-yellow-100 text-yellow-600',
    },
    {
        name: 'In Progress',
        color: 'bg-blue-100 text-blue-600',
    },
    {
        name: 'Pending Review',
        color: 'bg-purple-100 text-purple-600',
    },
    {
        name: 'Completed',
        color: 'bg-green-100 text-green-600',
    },
    {
        name: 'Canceled',
        color: 'bg-red-100 text-red-600',
    },
]

export const auditReportStatus = [
    {
        name: 'Pending Review',
        color: 'bg-blue-100 text-blue-600',
    },
    {
        name: 'Reviewed',
        color: 'bg-purple-100 text-purple-600',
    }
]

export const receiptStatus = [
    {
        name: 'Upcoming',
        color: 'bg-yellow-100 text-yellow-600',
    },
    {
        name: 'Delivered',
        color: 'bg-blue-100 text-blue-600',
    },
    {
        name: 'Checked',
        color: 'bg-purple-100 text-purple-600',
    },
    {
        name: 'Success',
        color: 'bg-green-100 text-green-600',
    },
    {
        name: 'Return',
        color: 'bg-red-100 text-red-600',
    },
]

export const requestStatus = [
    {
        name: 'Request Created',
        color: 'bg-yellow-100 text-yellow-600',
    },
    {
        name: 'Request Approved',
        color: 'bg-blue-100 text-blue-600',
    },
    {
        name: 'Materials Fulfilled',
        color: 'bg-purple-100 text-purple-600',
    },
    {
        name: 'Preparing for Delivery',
        color: 'bg-cyan-100 text-cyan-600',
    },
    {
        name: 'In Transit',
        color: 'bg-orange-100 text-orange-600',
    },
    {
        name: 'Delivered',
        color: 'bg-lime-100 text-lime-600',
    },
    {
        name: 'Completed',
        color: 'bg-green-100 text-green-600',
    },
    {
        name: 'Request Rejected',
        color: 'bg-pink-100 text-pink-600',
    },
    {
        name: 'Request Canceled',
        color: 'bg-red-100 text-red-600',
    },
]

export const returnStatus = [
    {
        name: 'Waiting for Approval',
        color: 'bg-yellow-100 text-yellow-600',
    },
    {
        name: 'Request Approved',
        color: 'bg-blue-100 text-blue-600',
    },
    {
        name: 'Picking up',
        color: 'bg-purple-100 text-purple-600',
    },
    {
        name: 'On Transit',
        color: 'bg-lime-100 text-lime-600',
    },
    {
        name: 'Delivered',
        color: 'bg-lime-100 text-lime-600',
    },
    {
        name: 'Completed',
        color: 'bg-green-100 text-green-600',
    },
    {
        name: 'Canceled',
        color: 'bg-red-100 text-red-600',
    },
]

export const shipmentStatus = [
    {
        name: 'Upcoming',
        color: 'bg-yellow-100 text-yellow-600',
    },
    {
        name: 'Delivered',
        color: 'bg-blue-100 text-blue-600',
    },
    {
        name: 'Auditing on progress',
        color: 'bg-purple-100 text-purple-600',
    },
    {
        name: 'Checked',
        color: 'bg-lime-100 text-lime-600',
    },
    {
        name: 'Success',
        color: 'bg-green-100 text-green-600',
    },
    {
        name: 'Return',
        color: 'bg-red-100 text-red-600',
    },
];