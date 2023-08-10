export default class RegexPattern {
  public static readonly EMAIL_ADDRESS = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  public static readonly NUMBER = /^\d+$/;
  public static readonly NAME = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/;
  public static readonly STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
  public static readonly MEDIUM_PASSWORD = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
  public static readonly TIMESTAMP = /^\d+$/; // TODO: Revert timestamp regex pattern: /^\d{13}(.0)?$/;
  public static readonly COORDINATE = /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
  public static readonly DATE_TIME: Record<string, RegExp> = {
    ['DD/MM/YYYY']: /^([1-9]|0[1-9]|[12][0-9]|3[01])\/([1-9]|0[1-9]|1[012])\/(19|20)\d\d$/,
  };
  public static readonly PHONE: Record<string, RegExp> = {
    HE: /^[05]\d{9}$|^[02|03|04|07|08|09]\d{8}|^[180]\d{9}$/,
  };

  public static readonly VIMEO_ID =
    /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
  public static readonly YOUTUBE_ID = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;

  public static readonly PASSWORD: Record<string, RegExp> = {
    LOWERCASE: /(?=.*[a-z])/,
    UPPERCASE: /(?=.*[A-Z])/,
    NUMERIC: /(?=.*[0-9])/,
    SPECIAL: /(?=.*[!@#$%^&*])/,
  };
}
