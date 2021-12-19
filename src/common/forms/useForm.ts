import {useCallback, useEffect, useMemo, useState} from 'react';
import {forOwn, isEmpty} from 'lodash';

export type FormValue = any;

export type FormValues<T> = T;

export type FormTouchedValues<T> = {
  [P in keyof T]?: boolean;
};

export type FormErrors = {
  [key: string]: string;
};

export type FormVisibleErrors<T> = {
  [P in keyof T]?: boolean;
};

const useForm = <T>(
  initialValues: FormValues<T>,
  onSubmit: (values: FormValues<T>) => void,
  validate: (values: FormValues<T>) => FormErrors<T>,
) => {
  const [values, setValues] = useState<FormValues<T>>(initialValues);
  const [touchedValues, setTouchedValues] = useState<FormTouchedValues<T>>({});
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const visibleErrors = useMemo(() => {
    const freshVisibleErrors = {} as FormVisibleErrors<T>;

    forOwn(errors, (error, name) => {
      if (
        submitAttempted ||
        touchedValues[name as keyof FormTouchedValues<T>] === true
      ) {
        freshVisibleErrors[name as keyof FormVisibleErrors<T>] = true;
      }
    });

    return freshVisibleErrors;
  }, [errors, touchedValues, submitAttempted]);

  const setValue = (name: string, value: any) => {
    setValues(
      Object.assign({}, values, {
        [name]: value,
      }),
    );
  };

  const setSomeValues = (someValues: any) => {
    setValues(Object.assign({}, values, someValues));
  };

  const setTouchedValue = (name: string, isTouched: boolean) => {
    setTouchedValues(
      Object.assign({}, touchedValues, {
        [name]: isTouched,
      }),
    );
  };

  const setSomeTouchedValues = (someTouchedValues: any) => {
    setTouchedValues(Object.assign({}, touchedValues, someTouchedValues));
  };

  const doValidate = useCallback(() => {
    const freshErrors = validate(values);
    setErrors(freshErrors);
    return freshErrors;
  }, [values, validate]);

  const handleChange = (name: string, value: any) => {
    setValue(name, value);
  };

  const handleFocus = (name: string) => {
    setFocusedInput(name);
  };

  const handleBlur = (name: string) => {
    setTouchedValue(name, true);
    if (focusedInput === name) {
      setFocusedInput(null);
    }
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);
    const freshErrors = doValidate();
    if (isEmpty(freshErrors)) {
      onSubmit(values);
    }
  };

  const handleReset = () => {
    setValues(initialValues);
    setErrors({});
    setSubmitAttempted(false);
  };

  useEffect(() => {
    doValidate();
  }, [values, doValidate]);

  return {
    values,
    touchedValues,
    errors,
    focusedInput,
    visibleErrors,
    submitAttempted,
    setValue,
    setFocusedInput,
    setSomeValues,
    setTouchedValue,
    setSomeTouchedValues,
    handleBlur,
    handleChange,
    handleFocus,
    handleSubmit,
    handleReset,
  };
};

export default useForm;
