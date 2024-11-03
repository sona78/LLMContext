function Dropper() {
  const handleDrop = () => {
    chrome.runtime.sendMessage("drop", (response: any) => {
      console.log(response);
    });
  };

  return (
    <>
      <button onClick={handleDrop}>Input on Current Page</button>
    </>
  );
}

export default Dropper;
