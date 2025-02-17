import React,{useEffect, useState} from 'react';
import { baseurl } from '../Global/Baseurl';

const Possiblecheckins = () => {
    const selectedbranchid = localStorage.getItem('selectedBranchId')
    const [todaycheckindate,settodaycheckindate]= useState([]);
    const [tommorrcheckindate,settomorroecheckindate]= useState([])


  useEffect(() => {
    const fetchPossibleCheckins = async () => {
      try {
         const response = await fetch(`${baseurl}/api/auth/possiblecheckins`, {
                headers: { 'x-branch-id': selectedbranchid, },
              });
              const data = await response.json();
        settodaycheckindate(data.possible_checkin_today);
        settomorroecheckindate(data.possible_checkin_tomorrow)
      
      } catch (error) {
        console.error('Error fetching user data:', error.response.data.message);
      }
    };

    fetchPossibleCheckins();
  }, []); // Re-fetch when the user ID changes


  return (
    <>
    <div className='possible-checkins-controller'>
        <div className='possible-checkings-controller-inner'>
         Possible checkins: 
         {todaycheckindate?
          <div>
           <span>Today checkin details</span> {todaycheckindate}
         </div> : 'No checkin for today'}


         {tommorrcheckindate?
          <div>

        <span>Tommorrow checkin details</span>    {tommorrcheckindate}
         </div> : 'No checkin for tomorrow'}
        </div>

    </div>
    </>
  )
}

export default Possiblecheckins