import { TbDroplet, TbWind } from "react-icons/tb";

const chipStyle = "flex items-center bg-white/60 backdrop-blur-md shadow-md px-3 py-1 rounded-full capitalize w-fit whitespace-nowrap ";

export const WeatherCloudChip = ({ data = {}, className = "" }) => {
  return (
    <span className={chipStyle + className}>
      {!data ? null :
        <img
          src={data ? `https://openweathermap.org/img/wn/${data.weather[0].icon}.png` : ''}
          alt={data ? data.weather[0].main : 'Unavailable'} className='drop-shadow-md w-7 mr-1'
        />
      }
      <p className='fredoka text-lg'>
        {data ? `${data?.clouds.all} % (${data?.weather[0].description})` : 'Unavailable'}
      </p>
    </span>
  )
};

export const WeatherHumidityWindChip = ({ data = {}, className = "" }) => {
  if (!data) {
    return (
      <span className={chipStyle + className}>
        <p className="fredoka text-lg">Unavailable</p>
      </span>
    )
  }

  return (
    <span className={chipStyle + className}>
      <TbDroplet />
      <p className='fredoka text-lg ml-1'>{data?.main.humidity} %</p>
      <p className='mx-2'>|</p>
      <TbWind />
      <p className='fredoka text-lg ml-1'>{data?.wind.speed} <span className='text-sm lowercase'>m/s</span></p>
    </span>
  )
}

export const WeatherTempChip = ({ temp = 0, className = "" }) => {
  return (
    <span className={chipStyle + className}>
      <p className='font-medium tracking-wider fredoka text-lg'>
        {temp ? `${temp.toFixed(1)}°C` : 'Unavailable'}
      </p>
    </span>
  )
}