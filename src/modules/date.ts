export default function calcOneWeek() {
  const now = new Date();
  const day = now.getDate();

  return new Date(new Date().setDate(day - 7));
}
