const toRadian = (deg: number): number => (Math.PI / 180) * deg;
export const calcDistanceBetweenTwoPoints = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const lat1Rad = toRadian(lat1);
  const lng1Rad = toRadian(lng1);
  const lat2Rad = toRadian(lat2);
  const lng2Rad = toRadian(lng2);

  const dlat = lat1Rad - lat2Rad;
  const dlng = lng1Rad - lng2Rad;

  const tempAns = Math.asin(
    Math.sqrt(
      Math.pow(Math.sin(dlat / 2), 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.pow(Math.sin(dlng / 2), 2)
    )
  );

  return tempAns * 2 * 3963.2;
};
