import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

const customStyles = {
    overlay: {
        zIndex: 10000
    },
    content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};
  
Modal.setAppElement('#app')

const AppModal = ({ modalOpen, modalClose, modalBody, modalTitle, onModalDelete, onModalUpdate, confirmBooking, focusEvent, focusEventUpdate }) => {
    const [nameError, setNameError] = useState(!1);
    
    const validateConfirmation = () => {
        if(!focusEvent.title){
            setNameError(!0);
            return;
        }
        confirmBooking()
    }

    return (
        <React.Fragment>
            <Modal
                isOpen={modalOpen === "create"}
                onRequestClose={modalClose}
                style={customStyles}
            >
                <div className="modal-header">
                    <h5 className="modal-header-title">{modalTitle}</h5>
                    <button className="close-btn" type="button" onClick={modalClose}>
                        <span className="close">X</span>
                    </button>
                </div>
                <div className="modal-content">
                    <p>{modalBody}</p>
                    <label>
                        Please provide some information for the event:
                        <input 
                            className={nameError && "error" || ""} 
                            type="text"
                            onChange={e => {
                                focusEventUpdate(e.target.value);
                                setNameError(e.target.value ? !1 : !0);
                            }}
                            value={focusEvent.title}
                        />
                        {nameError && <span style={{color:"red", fontSize: ".6rem"}}>Must not be empyt</span>}
                    </label>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-primary" onClick={validateConfirmation}>Confirm</button>
                    <button type="button" className="btn btn-secondary" onClick={modalClose}>Cancel</button>
                </div>
            </Modal>
            <Modal
                isOpen={modalOpen === "info"}
                onRequestClose={modalClose}
                style={customStyles}
            >
                <div className="modal-header">
                    <h5 className="modal-header-title">{modalTitle}</h5>
                    <button className="close-btn" type="button" onClick={modalClose}>
                        <span className="close">X</span>
                    </button>
                </div>
                <div className="modal-content">
                    <p>{modalBody}</p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-primary" onClick={modalClose}>Okay</button>
                </div>
            </Modal>
            <Modal
                isOpen={modalOpen === "update"}
                onRequestClose={modalClose}
                style={customStyles}
            >
                <div className="modal-header">
                    <h5 className="modal-header-title">{modalTitle}</h5>
                    <button className="close-btn" type="button" onClick={modalClose}>
                        <span className="close">X</span>
                    </button>
                </div>
                <div className="modal-content">
                    <label>
                        Event description:
                        <input 
                            className={nameError && "error" || ""} 
                            type="text"
                            onChange={e => {
                                focusEventUpdate(e.target.value);
                                setNameError(e.target.value ? !1 : !0);
                            }}
                            value={focusEvent.title}
                        />
                        {nameError && <span style={{color:"red", fontSize: ".6rem"}}>Must not be empyt</span>}
                    </label>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-primary" onClick={onModalUpdate}>Update Event</button>
                    <button type="button" className="btn btn-secondary" onClick={onModalDelete}>Delete Event</button>
                </div>
            </Modal>
        </React.Fragment>
    )
}

AppModal.propTypes = {
    modalOpen: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
    modalClose: PropTypes.func.isRequired,
    modalBody: PropTypes.string,
    modalTitle: PropTypes.string,
    onModalDelete: PropTypes.func.isRequired,
    onModalUpdate: PropTypes.func.isRequired,
    confirmBooking: PropTypes.func.isRequired,
    focusEvent: PropTypes.object,
    focusEventUpdate: PropTypes.func,
}

export default AppModal;