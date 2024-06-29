import React from "react";

function AddSite() {
  const [siteUrl, setSiteUrl] = React.useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(siteUrl);
  };
  return (
    <div className="py-[60px]  bg-[#B0A5F1] flex justify-around">
      <div className="w-2/5 flex flex-col justify-center">
        <span className="text-[45px] font-semibold  text-[#3d3182] ">Don't find a legitimate site ?</span>
        <span className="text-[30px] text-[#3d3182]">Request us to add it here</span>
      </div>
      <div className="h-11/12 w-2/5 my-auto flex justify-center items-center">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="Enter site URL"
            className="border-2 border-black/20 rounded-l-lg px-3 outline-none duration-150 w-[400px] bg-white/40 py-1.5"
          />
          <button type="submit" className="rounded-r-lg px-3 py-1 bg-[#3d3182] text-white shrink-0">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default AddSite;
