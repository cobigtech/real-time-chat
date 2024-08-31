import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"
import { useEffect, useRef } from "react"
import { Button } from "../components/ui/button"
import { splitText } from "./Chat"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import preview from "../assets/preview.jpg"

export default function Home() {
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      navigate("/chat")
    }
  }, [token, navigate])

  return (
    <div>
      <HeroSection />
      <PreviewSection />
      <FeaturesSection />
    </div>
  )
}

function HeroSection() {
  useGSAP(() => {
    gsap.from(".char", { delay: 0.2, duration: 0.3, stagger: 0.05, ease: "power1.out", y: 10, opacity: 0, rotateY: 40 })
    gsap.from(".rest", { delay: 1, duration: 1.5, ease: "power2.out", y: 50, opacity: 0 })
  })

  return (
    <section className="max-w-[56rem] min-h-[24rem] sm:min-h-[32rem] m-auto px-3 py-8 flex flex-col items-center gap-6 justify-center overflow-hidden">
      <h1 className="text-5xl sm:text-[6rem] font-extrabold tracking-tight text-center leading-none break-words whitespace-normal max-w-full">
        {splitText("The best chat app")}
      </h1>
      <div className="flex flex-col items-center gap-6 rest">
        <p className="text-neutral-300 text-xl text-center leading-8">
          Open source real-time chat app
          <br />
          that runs on the web.
        </p>
        <Button asChild>
          <Link to="/login">Open app</Link>
        </Button>
      </div>
    </section>
  )
}

function PreviewSection() {
  const previewImage = useRef(null)

  useGSAP(() => {
    gsap.from(previewImage.current, {
      delay: 1.5,
      duration: 1,
      ease: "power1.out",
      y: 100,
      opacity: 0,
      scale: 0.8,
      rotateX: -25,
    })
  })
  return (
    <section className="max-w-[56rem] m-auto px-3 pb-16" style={{ perspective: "2000px" }}>
      <div ref={previewImage}>
        <img src={preview} className="block rounded-2xl outline outline-neutral-900" alt="" />
      </div>
    </section>
  )
}

import feature1 from "../assets/feature-1.jpg"
import feature2 from "../assets/feature-2.jpg"
import feature3 from "../assets/feature-3.jpg"
import feature4 from "../assets/feature-4.jpg"

const features = [
  {
    heading: "Play a game",
    description: "Feeling bored? Play a game of TicTacToe with your friend.",
    image: feature1,
    isNew: true,
  },
  {
    heading: "Share images",
    description: "An image is worth a thousand words. Share pictures of your latest trip or discovery.",
    image: feature2,
    isNew: false,
  },
  {
    heading: "Group chats",
    description: "Create a unique place just for your group of friends.",
    image: feature3,
    isNew: false,
  },
  {
    heading: "Status and feedback",
    description: "Know in real-time when someone is online or typing something.",
    image: feature4,
    isNew: false,
  },
]

interface FeatureProps {
  feature: {
    heading: string
    description: string
    image: string
    isNew: boolean
  }
}

function Feature({ feature }: FeatureProps) {
  const elem = useRef(null)

  useGSAP(
    () => {
      gsap.from(".box", {
        scrollTrigger: {
          trigger: ".box",
          start: "top bottom",
        },
        delay: 0.1,
        duration: 2,
        ease: "power4.out",
        y: 75,
        opacity: 0,
      })
    },
    { scope: elem }
  )

  return (
    <article className="py-16 overflow-hidden group" ref={elem}>
      <div className="box grid sm:grid-cols-2 gap-4 sm:gap-12 items-center">
        <div>
          <h3 className="text-3xl font-semibold tracking-tight mb-4">
            {feature.heading}{" "}
            {feature.isNew && (
              <span className="align-middle inline-block ml-1 px-2 py-1 text-white text-xs bg-indigo-700 border border-indigo-400 rounded-full">
                New
              </span>
            )}
          </h3>
          <p className="text-neutral-300 w-2/3 leading-7">{feature.description}</p>
        </div>
        <div className="-order-1 sm:order-1 sm:group-even:-order-1">
          {feature.image ? (
            <img src={feature.image} alt="" className="block" />
          ) : (
            <div className="bg-neutral-800 aspect-video" />
          )}
        </div>
      </div>
    </article>
  )
}

function FeaturesSection() {
  return (
    <section className="max-w-[56rem] m-auto px-3 pb-16">
      {features.map((feature, id) => (
        <Feature key={id} feature={feature} />
      ))}
    </section>
  )
}
