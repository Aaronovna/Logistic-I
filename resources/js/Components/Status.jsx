const Status = ({ statusArray = [], status = '', style = 1, className = undefined, onClick = () => { }, suffix = '' }) => {
    let statusStyle;

    if (style === 1) {
        statusStyle = `leading-normal whitespace-nowrap p-1 px-3 rounded-lg w-fit h-fit ${className}`;
    }
    if (style === 2) {
        statusStyle = `leading-normal whitespace-nowrap p-1 px-3 rounded-full w-fit h-fit ${className}`;
    }

    return (
        <span onClick={onClick}
            className={`${statusStyle} ${statusArray.find(item => item.name === status)?.color}`}>
            {`${status} ${suffix}`}
        </span>
    )
}

export default Status;

const colorMap = {
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600',
    orange: 'bg-orange-100 text-orange-600',
    teal: 'bg-teal-100 text-teal-600',
    pink: 'bg-pink-100 text-pink-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    cyan: 'bg-cyan-100 text-cyan-600'
};

export const Badge = ({ Icon, name = '', style = 1, color = '', className = '', onClick = () => { } }) => {
    let badgeStyle = style === 2
        ? 'leading-normal whitespace-nowrap p-1 px-3 rounded-full w-fit h-fit'
        : 'leading-normal whitespace-nowrap p-1 px-3 rounded-lg w-fit h-fit';

    const colorClasses = colorMap[color] || '';

    return (
        <span
            onClick={onClick}
            className={`flex items-center ${badgeStyle} ${colorClasses} ${className}`.trim()}
        >
            {Icon ? <Icon className="mr-1"/> : null}
            {name}
        </span>
    );
};

