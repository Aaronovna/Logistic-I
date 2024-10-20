import { useStateContext } from "@/context/contextProvider";

export default function BusCard({ data, x }) {
  const { theme } = useStateContext();
  return (
    <div className='border-card p-4 flex gap-4 border-b-4 shadow-md' style={{ borderBottomColor: theme.accent }}>
      <div className={`${getRandomBusImage()} bus-1 h-20 w-20 bg-no-repeat bg-contain`}></div>
      <div className='w-4/5'>
        <p>AKE 3442</p>
        <p>On trip</p>
        <p className='text-ellipsis overflow-hidden whitespace-nowrap'>{x}</p>
      </div>
    </div>
  )
}

export function BusCard2({ data }) {
  const { theme } = useStateContext();
  return (
    <div className='border-card p-4 pb-2 flex flex-col gap-4 w-44 border-b-4 shadow-md' style={{ borderBottomColor: theme.accent }}>
      <div className={`${getRandomBusImage()} w-full h-32 bg-no-repeat bg-contain bg-center`}></div>
      <div className='w-4/5'>
        <p>AKE 3442</p>
        <p>Terminal 1</p>
      </div>
    </div>
  )
}

function getRandomBusImage() {
  const busNumbers = ["bus-1", "bus-2", "bus-3"];
  const randomIndex = Math.floor(Math.random() * busNumbers.length);
  return busNumbers[randomIndex];
}