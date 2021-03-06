import { useState, useCallback, useEffect } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { createStructuredSelector } from "reselect";
import { pick, path } from "ramda";
import { bindActionCreators } from "redux";
import * as actions from "modules/Dashboard/redux/actions";
import { makeSelectModules } from "modules/Dashboard/redux/selectors";
import Spinner from "components/Spinner";
import MetaForm from "./MetaForm";
import TypeForm from "./TypeForm";
import Contentful from "./Contentful";

const CreateEvent = ({
  className,
  createEventRequest,
  loading,
  fetchModulesRequest,
  modulesLoading,
  modules,
}) => {
  const [step, setStep] = useState(1);
  const [canCreateEvent, setCanCreateEvent] = useState(false);
  const [formData, setFormData] = useState({});

  const formDataHandler = useCallback(
    (values) => {
      setFormData({ ...formData, ...values });
    },
    [formData]
  );

  useEffect(() => {
    if (canCreateEvent) {
      createEventRequest(formData);
      setStep(1);
      setFormData({});
    }
  }, [canCreateEvent]);

  useEffect(() => {
    fetchModulesRequest();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <main className={className}>
      <h2>Create an event</h2>
      <MetaForm
        open={step === 1}
        next={() => setStep(2)}
        submitHandler={formDataHandler}
        initialValues={formData}
      />
      <TypeForm
        open={step === 2}
        next={() => setStep(3)}
        back={() => setStep(1)}
        submitHandler={formDataHandler}
        createEvent={() => setCanCreateEvent(true)}
      />
      <Contentful
        open={step === 3}
        next={() => setStep(4)}
        back={() => setStep(2)}
        submitHandler={formDataHandler}
        createEvent={() => setCanCreateEvent(true)}
      />
    </main>
  );
};

const StyledCreateEvent = styled(CreateEvent)`
  color: ${({ theme }) => theme.primaryDark};
  .form {
    width: 50%;
    margin: 2rem auto;
    text-align: center;

    .field-container {
      text-align: left;
    }

    .input-field,
    .react-tagsinput {
      margin: 0.5rem 0 2rem;
      font-size: inherit;
      padding: 1rem 2rem;
      display: block;
      width: 100%;
    }
    .react-tagsinput-input {
      font-size: 1rem;
      width: 65%;
    }
    label.upload {
      display: block;
      margin-bottom: 1rem;
    }
    .drop-zone {
      padding: 1rem;
    }
    .divider {
      margin: 1rem;
    }
    button[type="submit"] {
      margin-top: 2rem;
    }
  }

  @media only screen and (max-width: 768px) {
    .form {
      width: 85%;
      margin-bottom: 5rem;
    }
  }
`;

const mapStateToProps = createStructuredSelector({
  loading: path(["dashboard", "createEvent", "loading"]),
  modulesLoading: path(["dashboard", "modules", "loading"]),
  modules: makeSelectModules(),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    pick(["createEventRequest", "fetchModulesRequest"], actions),
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(StyledCreateEvent);
