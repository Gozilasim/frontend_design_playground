'use client';

import React from 'react';
import { DesignProps } from '@/data/designRegistry';
import { cn } from '@/lib/utils';
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';

export default function ThreeDCardDesign({ viewport }: DesignProps) {
  const isLarge = viewport && viewport.width >= 768;

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4">
      <CardContainer className="inter-var">
        <CardBody
          className={cn(
            'bg-slate-900/80 relative group/card',
            'dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.15]',
            'dark:border-white/[0.1] border-slate-700/[0.3]',
            isLarge ? 'sm:w-[30rem]' : 'w-full',
            'h-auto rounded-xl p-6 border backdrop-blur-sm',
          )}
        >
          <CardItem
            translateZ="50"
            className="text-xl font-bold text-slate-100 dark:text-white"
          >
            CSS 3D Perspective Transform
          </CardItem>
          <CardItem
            as="p"
            translateZ="60"
            className="text-slate-400 text-sm max-w-sm mt-2 dark:text-neutral-300"
          >
            Move your cursor across this card to experience real-time 3D
            transformations powered by pure CSS perspective.
          </CardItem>
          <CardItem translateZ="100" className="w-full mt-4">
            <img
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              height="1000"
              width="1000"
              className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
              alt="Code editor on desk"
            />
          </CardItem>
          <div className="flex justify-between items-center mt-20">
            <CardItem
              translateZ={20}
              as="a"
              href="https://github.com"
              target="_blank"
              className="px-4 py-2 rounded-xl text-xs font-normal text-slate-300 dark:text-white"
            >
              View Source
            </CardItem>
            <CardItem
              translateZ={20}
              as="button"
              className="px-4 py-2 rounded-xl bg-emerald-600 dark:bg-white dark:text-slate-900 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
            >
              Explore
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </div>
  );
}
