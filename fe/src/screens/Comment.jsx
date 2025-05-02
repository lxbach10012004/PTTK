import Navbar from "../components/Navbar";

const Comment = () => {
  return (
    <>
      <Navbar />
      <form className="flex flex-col gap-2">
        <label>Góp ý tại đây</label>
        <div className="flex gap-2">
          <input className="border rounded w-1/2" type="text" />
          <button className="cursor-pointer border rounded px-2" type="submit">
            Gửi
          </button>
        </div>
      </form>
    </>
  );
};

export default Comment;
