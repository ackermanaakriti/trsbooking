

import React, { useState,useEffect } from 'react'

const Complementries = ({ formData, setFormData, complementaries }) => {
  console.log('from data checking',formData)
  let updatedGroupedData={}
    const [selectedDates, setSelectedDates] = useState([]);
    const [groupedData,setGroupedData]= useState([])
    useEffect(() => {

      if(formData.complementaries)
      { 
        setGroupedData(formData.complementaries)
      }
      console.log('-------------------------',groupedData)
          if (formData.check_in_date && formData.check_out_date) {
            const dates = [];
            let currentDate = new Date(formData.check_in_date);
            const endDate = new Date(formData.check_out_date);
      
            while (currentDate <= endDate) {
              dates.push(currentDate.toISOString().split("T")[0]);
              currentDate.setDate(currentDate.getDate() + 1);
            }
            setSelectedDates(dates);
          }
        }, [formData.check_in_date, formData.check_out_date]);
       



        const handleStatusChange = (day, service) => {
          console.log(day, service);
          console.log('-------------', groupedData);
        
          // Clone the groupedData state to avoid direct mutation
          const updatedGroupedData = { ...groupedData };
        
          // If the day doesn't exist in updatedGroupedData, initialize it as an empty array
          if (!updatedGroupedData[day]) {
            updatedGroupedData[day] = [];
          }
        
          // Check if the service is already selected (checked)
          const isSelected = updatedGroupedData[day].includes(service);
        
          // If the service is selected, remove it; if not, add it
          if (isSelected) {
            updatedGroupedData[day] = updatedGroupedData[day].filter(s => s !== service);
          } else {
            updatedGroupedData[day].push(service);
          }
        
          console.log('Updated groupedData:', updatedGroupedData);
        
          // Update formData to reflect the changes
          setFormData(prevData => ({
            ...prevData,
            complementaries: updatedGroupedData,
          }));
        
          // Also update groupedData locally so it reflects the changes
          setGroupedData(updatedGroupedData);
        };
        
       



        
        return (
          <>
            <h4>Complementaries</h4>
            {selectedDates?.map((date) => (
              <div className='complementries-wrapper' key={date}>
                <p>{date}</p>
                {complementaries?.map((comp) => {
                  // Ensure formData.complementaries is an array and check if the service_name exists for the current date
                  const isChecked = formData.complementaries[date]?.includes(comp.service_name);

        
                  return (
                    <label key={comp.id}>
                      <input
                        checked={isChecked}
                        onChange={() => handleStatusChange(date, comp.service_name)}
                        type="checkbox"
                      />
                      {comp.service_name}
                    </label>
                  );
                })}
              </div>
            ))}
          </>
        );
        
        
}

export default Complementries