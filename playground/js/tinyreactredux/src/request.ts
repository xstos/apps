import axios from "axios";

type TOnSuccess = (value: { data: any}) => void;
type TOnError = (reason: any) => void;

export function get(url: string, onSuccess: TOnSuccess, onError: TOnError) {
  axios.get(url)
    .then(value => onSuccess(value))
    .catch(reason => onError(reason))
    .then(() => {
      // always executed, cleanup
    });
}
