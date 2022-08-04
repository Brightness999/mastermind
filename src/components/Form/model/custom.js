/**
 * Custom form components,
 * If you need to use form control in the column
 * 
    return form.getFieldDecorator('xxx')(
      // ...
    );
 */
export default ({form, render, record, ...otherProps}) => render(record, form, otherProps);
