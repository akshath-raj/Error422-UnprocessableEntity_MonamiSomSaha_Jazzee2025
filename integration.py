
import whisper
import pyaudio
import wave
import tempfile
import os
import time
import torch

from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
import soundfile as sf
import sounddevice as sd
from groq import Groq
from dotenv import load_dotenv
import translators as ts


CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000

def get_llm_reply_from_groq(prompt, api_key, system_prompt="You are a helpful assistant for a pharmacy.You sell a wide variety of baby product like johnsons baby, mammy poko, you are also open 24/7.Give short reply."):
    client = Groq(api_key=api_key)

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=512
    )

    return response.choices[0].message.content

def translate_text(text, to_lang):
    try:
        return ts.translate_text(text, to_language=to_lang, translator="google")
    except Exception as e:
        print(f"[Translation Error] {e}")
        return text  # fallback to original text


def setup_indic():

    print("Loading Indic TTS model...")
    model = ParlerTTSForConditionalGeneration.from_pretrained("ai4bharat/indic-parler-tts")
    tokenizer = AutoTokenizer.from_pretrained("ai4bharat/indic-parler-tts")
    description_tokenizer = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
    return model, tokenizer, description_tokenizer

def play_audio(file_path):
    data, samplerate = sf.read(file_path)
    sd.play(data, samplerate)
    sd.wait()

def generate_tts_audio(model, tokenizer, description_tokenizer, prompt, description, output_path="indic_tts_out.wav"):
    description_input_ids = description_tokenizer(description, return_tensors="pt")
    prompt_input_ids = tokenizer(prompt, return_tensors="pt")

    generation = model.generate(
        input_ids=description_input_ids.input_ids,
        attention_mask=description_input_ids.attention_mask,
        prompt_input_ids=prompt_input_ids.input_ids,
        prompt_attention_mask=prompt_input_ids.attention_mask
    )

    audio_arr = generation.cpu().numpy().squeeze()
    sf.write(output_path, audio_arr, model.config.sampling_rate)
    return output_path


def setup_whisper():
    print("Loading Whisper model...")
    model = whisper.load_model("medium")  # Use 'large' for better accuracy
    print("Model loaded successfully!")
    return model

def record_audio_pyaudio():
    print("\nRecording... Press Enter to stop recording.")
    p = pyaudio.PyAudio()

    stream = p.open(format=FORMAT,
                    channels=CHANNELS,
                    rate=RATE,
                    input=True,
                    frames_per_buffer=CHUNK)

    frames = []
    recording = True

    import threading

    def wait_for_enter():
        input()
        nonlocal recording
        recording = False

    input_thread = threading.Thread(target=wait_for_enter)
    input_thread.start()

    while recording:
        data = stream.read(CHUNK)
        frames.append(data)

    print("Recording stopped.")
    stream.stop_stream()
    stream.close()
    p.terminate()

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    with wave.open(temp_file.name, 'wb') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))

    return temp_file.name


def transcribe_and_translate(model, audio_file):
    print("Transcribing and translating...")

    result_translation = model.transcribe(audio_file, task="translate", fp16=False)
    result_original = model.transcribe(audio_file, task="transcribe", fp16=False)

    return {
        "detected_language": result_translation["language"],
        "original_text": result_original["text"],
        "english_translation": result_translation["text"]
    }

def main():
    load_dotenv()
    api_key = os.getenv("GROQ_API_KEY")
    model = setup_whisper()
    model1, tokenizer, description_tokenizer=setup_indic()
    print("\nReal-time Speech-to-English (Press Ctrl+C to stop)\n")
    voice_descriptions = {
        "en": "Thoma speaks in a clear and soft voice in English.",
        "hi": "Rohit speaks in a clear and deep voice in Hindi.",
        "ta": "Jaya speaks in a clear and soft voice in Tamil.",
      
    }

    try:
        while True:
            audio_file = record_audio_pyaudio()
            result = transcribe_and_translate(model, audio_file)
            os.remove(audio_file)

            print("\n" + "="*50)
            print("SPEECH-TO-TEXT RESULTS")
            print("="*50)
            print(f"Detected Language: {result['detected_language'].upper()}")
            print(f"\nOriginal Text ({result['detected_language']}):")
            print(result['original_text'])
            print(f"\nEnglish Translation:")
            print(result['english_translation'])
            print("="*50)

            reply_text=get_llm_reply_from_groq(prompt=result['english_translation'], api_key=api_key)
            print(f"\nLLM Reply: {reply_text}")
            if result["detected_language"] != "en":
                reply_text= translate_text(reply_text, result['detected_language'])
             
            print(f"\nTranslated Reply: {reply_text}")
            description=voice_descriptions.get(result['detected_language'])


            audio_path = generate_tts_audio(model1, tokenizer, description_tokenizer, prompt=reply_text, description=description)
            play_audio(audio_path)
            os.remove(audio_path)
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nTest DOne")

if __name__ == "__main__":
    main()
