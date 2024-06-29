import React from "react";
export default function BasicTable() {
  return (
    <div className=" py-[100px] overflow-x-auto bg-gradient-to-b  from-[#aea0ff] via-[#C7BFF0] via-500%  to-[#B0A5F1]">
      <h1 className=" text-3xl text-center font-semibold text-[60px] mb-[80px] text-[#4C3EA0]">
        Site Knowledge
      </h1>

      <table className="w-4/6 m-auto border-collapse text-sm">
        <thead>
          <tr className=" border-b   border-gray-600 bg-muted text-muted-foreground">
            <th className="px-6 py-4 text-[20px] text-center font-medium">Site Name</th>
            <th className="px-6 py-4 text-[20px] text-center font-medium">Sites</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b  border-gray-400  hover:bg-muted/40 active:bg-muted/60">
            <td
              className="px-6 py-4 border-r text-[17px] border-gray-400 font-medium text-center"
              rowSpan="3"
            >
              Amazon
            </td>
            <td className="text-center px-6 text-[16px] py-4">www.amazon.com</td>
          </tr>
          <tr className="border-b border-gray-400 hover:bg-muted/40 active:bg-muted/60">
            <td className="text-center px-6 py-4">www.amazon.in</td>
          </tr>
          <tr className="border-b border-gray-400 hover:bg-muted/40 active:bg-muted/60">
            <td className="text-center px-6 py-4">www.amazon.co.uk</td>
          </tr>
          <tr className="border-b border-gray-400 hover:bg-muted/40 active:bg-muted/60">
            <td
              className="text-center border-r  border-gray-400 px-6 py-4 font-medium"
              rowSpan="3"
            >
              Facebook
            </td>
            <td className="text-center px-6 py-4">www.facebook.com</td>
          </tr>
          <tr className=" border-b border-gray-400 hover:bg-muted/40 active:bg-muted/60">
            <td className="text-center px-6 py-4">en-gb.facebook.com</td>
          </tr>
          <tr className="border-b border-gray-400 hover:bg-muted/40 active:bg-muted/60">
            <td className="text-center px-6 py-4">in-hi.facebook.com</td>
          </tr>
          <tr className="border-b border-gray-400 hover:bg-muted/40 active:bg-muted/60">
            <td
              className=" text-center border-r  border-gray-400 px-6 py-4 font-medium"
              rowSpan="3"
            >
              Instagram
            </td>
            <td className="text-center px-6 py-4">www.instagram.com</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
