import React from 'react'

const newInquiryform = () => {
    const [formData, setFormData] = useState({
       customer_name: '',
       customer_phoneno: '',
       remarks:'',
       no_of_pax:'',
       looking_approxdate:''
     });
  return (
    <>
    <div className="main-container-wrapper form-container">
    <div className='main-container-inner'>
      <div className='form-header'> 
      <h2>{id ? 'Edit Inquiry' : 'Add Inquiry'}</h2>
    </div> 
    <form>
    <div className='form-inner-forms'>
    <div className='input-wrapper'>
          <label htmlFor="customer_phoneno">Customer Phone No.:</label>
          <input
            type="text"
            id="customer_phoneno"
            name="customer_phoneno"
            value={formData.customer_phoneno}
            onChange={handleChange}
            required
          />
        </div>
    </div>
    </form>
    </div>
    </div>
    </>
  )
}

export default newInquiryform