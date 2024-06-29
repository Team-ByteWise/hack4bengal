import React from "react";
import axios from "axios";

function AddSite() {
  const [siteUrl, setSiteUrl] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/train", { urls: [siteUrl] })
      .then((res) => {
        if (res.data.status === "success") {
          setSubmitted(true);
          setSuccess(true);
        } else {
          setSubmitted(true);
          setSuccess(false);
        }
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      });
  };
  return (
    <div className="py-[60px]  bg-[#B0A5F1] flex justify-around">
      <div className="w-2/5 flex flex-col justify-center">
        <span className="text-[45px] font-semibold  text-[#3d3182] ">
          Don&apos;t find a legitimate site ?
        </span>
        <span className="text-[30px] text-[#3d3182]">
          Request us to add it here
        </span>
      </div>
      <div className="h-[50px] w-2/5 my-auto flex flex-col  items-center gap-y-4">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="Enter site URL"
            className="border-2 border-black/10 rounded-l-lg px-3 outline-none duration-150 w-[400px] bg-white/40 py-1.5"
          />
          <button
            type="submit"
            className="rounded-r-lg px-3 py-1 bg-[#3d3182] text-white shrink-0"
          >
            Submit
          </button>
        </form>
        {submitted &&
          (success ? (
            <div className="text-[#3d3182] text-xl font-bold">
              URL has been submitted!
            </div>
          ) : (
            <div className="text-[#823131] text-xl font-bold">
              Failed to submit URL!
            </div>
          ))}
      </div>
    </div>
  );
}

export default AddSite;
