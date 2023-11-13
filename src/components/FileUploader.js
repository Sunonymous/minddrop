import React from "react";

// meant to parse JSON from saved file into active state

export function FileUploader({ callback }) {
    const handleUpload = (e) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], 'UTF-8');
        fileReader.onload = (e) => {
          let json;
          try {
            json = JSON.parse(e.target.result);
          } catch (error) {
            console.error('Could not parse JSON from file.');
          }

          if (!!json) {
            console.log('Upload results:', json);
            
            // do the thing!!
            callback(json);
          }
        };
    };

    return (<input type="file" onChange={handleUpload} />);
}