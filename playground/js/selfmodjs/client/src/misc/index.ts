export const toDateTime = (date=new Date()) => {
    const yr = date.getFullYear()
    const mo = date.getMonth()+1
    const day = date.getDate()
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();
    return [yr,mo,day,hours,minutes,seconds,milliseconds]
};
