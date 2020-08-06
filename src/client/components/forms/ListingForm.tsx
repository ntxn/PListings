import React, { useState, ChangeEvent } from 'react';
import {
  reduxForm,
  Field,
  WrappedFieldProps,
  InjectedFormProps,
} from 'redux-form';

import { ListingAttrs } from '../../../server/models';
import { ListingImagesParams } from '../../utilities';

interface FieldProps {
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
}

interface PhotoUploadFieldProps {
  initialPhotos?: string[];
}

interface FormProps {
  // submitBtnText: string;
  // formTitle: string;
  sendRequest(
    formValues: ListingAttrs,
    imagesParams: ListingImagesParams
  ): void;
  images?: string[];
}

type ReduxFormProps = InjectedFormProps<ListingAttrs, FormProps> & FormProps;
interface FormState {
  deletedImageIndexes: number[];
  newImages: Record<number, File>;
  newImagesNextIndex: number;
}

class Form extends React.Component<ReduxFormProps, FormState> {
  constructor(props: ReduxFormProps) {
    super(props);
    this.state = {
      deletedImageIndexes: [],
      newImages: {},
      newImagesNextIndex: 0,
    };
  }

  deleteExistingImage = (index: number): void => {
    this.setState(prevState => {
      return {
        deletedImageIndexes: [...prevState.deletedImageIndexes, index],
      };
    });
  };

  deleteNewImage = (index: number): void => {
    this.setState(prevState => {
      const images = { ...prevState.newImages };
      delete images[index];

      return { newImages: images };
    });
    setTimeout(() => console.log(this.state.newImages), 3000);
  };

  addNewImage = (file: File): void => {
    this.setState(prevState => {
      return {
        newImages: {
          ...prevState.newImages,
          [prevState.newImagesNextIndex]: file,
        },
        newImagesNextIndex: prevState.newImagesNextIndex + 1,
      };
    });
  };

  // Multiple images upload
  renderPhotoUpload: React.StatelessComponent<WrappedFieldProps> = ({
    input: { value, ...inputProps },
    meta,
  }): JSX.Element => {
    const err = meta.error && meta.touched;

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) return;

      let reader: FileReader;
      const imgContainer = document.getElementById('form__user-photo');

      for (let i = 0; i < event.target.files.length; i++) {
        const index = i + this.state.newImagesNextIndex;

        reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const img = document.createElement('img');
          img.src = `${e.target!.result}`;
          img.id = `${index}`;
          img.width = 200;
          img.onclick = () => this.deleteNewImage(index);

          imgContainer!.appendChild(img);
        };
        reader.readAsDataURL(event.target.files[i]);

        this.addNewImage(event.target.files[i]);
      }
    };

    const insertExistingImages = (): JSX.Element => {
      const { deletedImageIndexes } = this.state;
      const images =
        deletedImageIndexes.length === 0
          ? this.props.images
          : this.props.images!.filter(
              (img, index) => !deletedImageIndexes.includes(index)
            );

      return (
        <>
          {images!.map(filename => {
            return <img key={filename} src={`/img/listings/${filename}`} />;
          })}
        </>
      );
    };

    return (
      <div className="form__group">
        <div id="form__user-photo">
          {this.props.images &&
            this.props.images.length !==
              this.state.deletedImageIndexes.length &&
            insertExistingImages()}
        </div>
        <input
          {...inputProps}
          type="file"
          multiple
          id={inputProps.name}
          accept="image/*"
          onChange={onChange}
          // className="form__upload"
        />
        {/* <label
          htmlFor={inputProps.name}
          className="btn-text btn-text--underlined--orange"
        >
          Choose new photo
        </label> */}
        <div className="form__error">{err ? meta.error : null}</div>
      </div>
    );
  };

  // dropdown list

  onSubmit = (formValues: ListingAttrs): void => {
    delete formValues.photos;

    const { deletedImageIndexes, newImages } = this.state;
    let existingImages = this.props.images;
    let deletedImages: string[] | undefined = undefined;
    if (deletedImageIndexes.length > 0) {
      existingImages = [];
      deletedImages = [];
      this.props.images!.forEach((img, index) => {
        if (deletedImageIndexes.includes(index)) deletedImages!.push(img);
        else existingImages!.push(img);
      });
    }

    this.props.sendRequest(formValues, {
      newImages,
      existingImages,
      deletedImages,
    });
  };

  render() {
    return (
      <div>
        <form onSubmit={this.props.handleSubmit(this.onSubmit)}>
          <input type="submit" disabled style={{ display: 'none' }} />
          <Field name="photos" component={this.renderPhotoUpload} />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export const ListingForm = reduxForm<ListingAttrs, FormProps>({
  form: 'listingForm',
  // validate: () => {
  //   return { bla: 'bla' };
  // },
})(Form);
