"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Navbar from "./components/Navbar";
import Image, { StaticImageData } from "next/image";
import placeholder from "@/public/placeholder.jpg";
import akmal from "@/public/profilepic/akmal.jpeg";
import andhika from "@/public/profilepic/andhika.jpeg";
import justin from "@/public/profilepic/justin.jpeg";

export default function Home() {
  const [displayedImage, setDisplayedImage] =
    useState<StaticImageData>(placeholder);
  const [andhikaimage] = useState<StaticImageData>(andhika);
  const [akmalimage] = useState<StaticImageData>(akmal);
  const [justinimage] = useState<StaticImageData>(justin);
  const [isReset, setIsReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState("TEKSTUR");
  const [currentPage, setCurrentPage] = useState(1);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [datasetUploaded, setDatasetUploaded] = useState(false);
  const [maxPage, setMaxPage] = useState(99);
  const [deleteExisting, setDeleteExisting] = useState("FALSE");

  useEffect(() => {
    if (isReset) {
      fetch(`/reset`); // Call reset logic here using fetch or perform other actions
      setIsReset(false); // Reset the isReset state back to false
    }
  }, [isReset]);
  function reset() {
    setIsReset(true); // Set isReset to true to trigger the useEffect
  }

  async function displayUpload() {
    const response = await fetch(`/display_upload`);
    const data = await response.json();
    const imageContainer = document.getElementById("upload-image-container");

    if (imageContainer) {
      imageContainer.innerHTML = ""; // Clear existing images

      if (data.image) {
        const imgElement = document.createElement("img");
        imgElement.src = data.image;
        imgElement.style.maxWidth = "300px";
        imgElement.style.margin = "10px";
        imageContainer.appendChild(imgElement);
      }
    } else {
      console.error(
        "Element with ID 'upload-image-container' not found in the DOM"
      );
    }
  }

  function swap_mode() {
    setMode((prevMode) => (prevMode === "TEKSTUR" ? "WARNA" : "TEKSTUR"));
  }

  function persistDataset() {
    setDeleteExisting((prevDeleteExisting) =>
      prevDeleteExisting === "FALSE" ? "TRUE" : "FALSE"
    );
  }

  async function fetchImages(page: number) {
    const imageContainer = document.getElementById("image-container");
    const pageIndicator = document.getElementById("pageIndicator");

    if (imageContainer && pageIndicator && datasetUploaded && fileUploaded) {
      imageContainer.innerHTML = ""; // Clear existing images
      console.log("mode :", mode);
      const response = await fetch(`/get_images?page=${page}&mode=${mode}`);
      const data = await response.json();

      setMaxPage(data.max_page); // Update maxPage using setMaxPage

      data.images.forEach((image: { url: string }) => {
        // Define type for 'image' or use more precise type
        const imgElement = document.createElement("img");
        imgElement.src = image.url;
        imgElement.style.maxWidth = "300px";
        imgElement.style.margin = "10px";
        imageContainer.appendChild(imgElement);
      });

      // Update the page indicator text content
      pageIndicator.textContent = `Page ${page}`;
    }
  }

  function uploadSearchImage() {
    const fileInput = document.getElementById(
      "fileInput"
    ) as HTMLInputElement | null;

    if (fileInput?.files && fileInput.files.length > 0) {
      const formData = new FormData();
      for (const file of Array.from(fileInput.files)) {
        formData.append("files", file);
      }

      fetch(`/upload_search`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setFileUploaded(true); // Update fileUploaded state
          displayUpload();
          console.log("Search file uploaded:", data.filenames);
        })
        .catch((error) => {
          console.error("Error uploading files:", error);
        });
    }
  }

  function test_ping() {
    fetch(`/test_ping`);
    console.log("Ping");
  }

  function uploadDatasetImage() {
    console.log("Trigger dataset upload");
    const fileInput = document.getElementById(
      "datasetInput"
    ) as HTMLInputElement | null;

    if (fileInput?.files && fileInput.files.length > 0) {
      const formData = new FormData();
      for (const file of Array.from(fileInput.files)) {
        formData.append("files", file);
      }

      fetch(`/upload_dataset?delete_existing=${deleteExisting}`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setDatasetUploaded(true); // Update datasetUploaded state
          console.log("Dataset uploaded:", data.filenames);
          if (datasetUploaded && fileUploaded) {
            fetchImages(1);
          }
          // after uploading dataset, attempt to calculate images
        })
        .catch((error) => {
          console.error("Error uploading dataset files:", error);
        });
    }
  }

  function forceload() {
    fetch("/force_load")
      .then(() => {
        displayUpload();
        setFileUploaded(true); // Update fileUploaded state
        setDatasetUploaded(true); // Update datasetUploaded state
        fetchImages(1);
      })
      .catch((error) => {
        console.error("Error during force load:", error);
      });
  }

  const handleNextPage = () => {
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
      fetchImages(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      fetchImages(currentPage - 1);
    }
  };

  const imageHandler = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const inputImageHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    // Implement inputImageHandler to handle image input change event
  };

  return (
    <main id="home" className="bg-white w-full text-black flex flex-col items-center">
      <Navbar />
      <div className="mt-[100px] flex flex-col items-center gap-y-8 w-full">
        <h1 className="text-5xl text-[black] font-bold">
          Reverse Image Search
        </h1>
        <div className="h-[450px] w-[70%] border-2 border-black rounded-xl p-8 flex items-center justify-between gap-x-8">
          <div className="flex flex-col gap-y-16 items-start">
            <button
              className="bg-black text-white px-3 py-3 w-[175px] rounded-full font-bold hover:bg-[beige] hover:text-black hover:shadow-xl transition-all"
              onClick={imageHandler}
            >
              Upload Image
            </button>
            <div className="hidden">
              <input
                id="picture"
                type="file"
                ref={fileInputRef}
                onChange={inputImageHandler}
              />
            </div>
            <button className="bg-black text-white px-3 py-3 w-[175px] rounded-full font-bold hover:bg-[beige] hover:text-black hover:shadow-xl transition-all">
              Upload Dataset
            </button>
          </div>
          <div className="h-[400px] w-[400px] overflow-hidden">
            <Image
              src={displayedImage}
              alt="akmal"
              height={400}
              width={400}
              className="rounded-xl object-fill"
            />
          </div>
        </div>
        <button className="bg-black text-white px-3 py-3 w-[175px] rounded-full font-bold hover:bg-red-600 hover:text-black hover:shadow-xl transition-all text-2xl">
          Search
        </button>
        <section
          id="result"
          className=" text-black flex flex-col items-center text-5xl font-bold bg-[beige] w-full h-full mt-10"
        >
          <h3 className="">Result</h3>
          <div className="grid-cols-6 columns-6 grid"></div>
        </section>
        <section
          id="how-to-use"
          className="flex flex-col items-center gap-y-8 bg-white mt-10"
        >
          <h1 className="text-5xl text-[black] font-bold">How To Use</h1>
          <div className="flex flex-col gap-6">
            <div className="bg-[beige] text-black  px-3 py-3 w-[800px] rounded-full ">
              <h3 className="mx-12 my-2 text-2xl font-bold">Step 1</h3>
              <p className="mx-14 my-2">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nemo
                at expedita corrupti maxime? Voluptatem omnis maxime quod
                consequatur molestiae rerum aperiam sint iste, ratione, quaerat
                repellat necessitatibus alias, minima velit!
              </p>
            </div>
            <div className="bg-[beige] text-black  px-3 py-3 w-[800px] rounded-full">
              <h3 className="mx-12 my-2 text-2xl font-bold">Step 2</h3>
              <p className="mx-14 my-2">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nemo
                at expedita corrupti maxime? Voluptatem omnis maxime quod
                consequatur molestiae rerum aperiam sint iste, ratione, quaerat
                repellat necessitatibus alias, minima velit!
              </p>
            </div>
            <div className="bg-[beige] text-black  px-3 py-3 w-[800px] rounded-full ">
              <h3 className="mx-12 my-2 text-2xl font-bold">Step 3</h3>
              <p className="mx-14 my-2">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nemo
                at expedita corrupti maxime? Voluptatem omnis maxime quod
                consequatur molestiae rerum aperiam sint iste, ratione, quaerat
                repellat necessitatibus alias, minima velit!
              </p>
            </div>
          </div>
        </section>
        <section className="mt-10 text-black flex flex-col items-center text-5xl font-bold bg-[beige] w-full h-full">
          <h3 id="about-us" className="mt-10">
            About Us
          </h3>
          <div className="columns-3  gap-20 mt-10">
          <div
                style={{
                  border: "4px solid black",
                  overflow: "hidden",
                  position: "relative",
                  width: "300px", // Adjust width as needed
                  height: "420px", // Adjust height as needed
                  display: "inline-block", // Ensures inline block display
                  borderRadius: "20px"
                }}
              >
                <Image
                  src={andhikaimage}
                  alt="akmal"
                  height={400}
                  width={300}
                  className="rounded-xl"
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    color: "black",
                    textAlign: "center",
                    padding: "8px",
                    
                  }}
                >
                  <p className="text-xl">Mohammad Andhika Fadillah</p>
                  <p className="text-xl">13522128</p>
                </div>
              </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  border: "4px solid black",
                  overflow: "hidden",
                  position: "relative",
                  width: "300px", // Adjust width as needed
                  height: "420px", // Adjust height as needed
                  display: "inline-block", // Ensures inline block display
                  borderRadius: "20px"
                }}
              >
                <Image
                  src={akmalimage}
                  alt="akmal"
                  height={400}
                  width={300}
                  className="rounded-xl"
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    color: "black",
                    textAlign: "center",
                    padding: "8px",
                    
                  }}
                >
                  <p className="text-xl">Mohammad Akmal Ramadan</p>
                  <p className="text-xl">13522161</p>
                </div>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  border: "4px solid black",
                  overflow: "hidden",
                  position: "relative",
                  width: "300px", // Adjust width as needed
                  height: "420px", // Adjust height as needed
                  display: "inline-block", // Ensures inline block display
                  borderRadius: "20px"
                }}
              >
                <Image
                  src={justinimage}
                  alt="akmal"
                  height={400}
                  width={300}
                  className="rounded-xl"
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    color: "black",
                    textAlign: "center",
                    padding: "9.5px",
                  }}
                >
                  <p className="text-xl">Justin Aditya Putra Prabakti</p>
                  <p className="text-xl">13522130</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
